// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interface/ICondominium.sol";

contract Condominium is ICondominium {
    
    address public manager;
    mapping(uint16 => bool) public residences; //(unidade => true)
    
    lib.Resident[] public residents;
    mapping(address => uint) private _residentIndex; // wallet => array index

    address[] public counselors;

    lib.Topic[] public topics;
    mapping(bytes32 => uint) private _topicIndex; //topic hash => array index

    mapping (uint16 => uint) private _nextPayment; //unidade => proximo pagamento(timestamp)

    mapping(bytes32 => lib.Vote[]) private _votings; //topicId => votos
    
    uint public monthlyQuota = 0.01 ether;

    uint constant private _thirtyDays = 30 * 24 * 60 * 60;

    constructor() {
        manager = msg.sender;

        for (uint16 i = 1; i <= 2; i++) {
            for (uint16 j = 1; j < 5; j++) {
                for (uint16 k = 0; k <= 5; k++) {
                    residences[(i * 1000) + (j * 100) + k] = true;
                }
            }
        }
    }

    function getManager() external view returns(address) {
        return manager;
    }

    function addResident(address resident, uint16 residenceId ) external onlyCouncil validAddress(resident) {
        require(residenceExists(residenceId), "Esta residencia nao existe");
        
        residents.push(lib.Resident({
            wallet: resident,
            residence: residenceId,
            isCounselor: false,
            isManager: resident == manager,
            nextPayment: 0
        }));
        
        _residentIndex[resident] = residents.length - 1;
    }

    function removeResident(address resident) external onlyManager {
        require(!_isCounselor(resident), "Um conselheiro nao pode ser removido");
        
        uint index = _residentIndex[resident];
        uint lastIndex = residents.length - 1;

        if(index != lastIndex) {
            lib.Resident memory latest = residents[lastIndex];
            residents[index] = latest;
            _residentIndex[latest.wallet] = index;
        }

        residents.pop();
        delete _residentIndex[resident];
    }

    function getResident(address resident) external view returns(lib.Resident memory) {
        return _getResident(resident);
    }

    function _getResident(address resident) private view returns(lib.Resident memory) {
        uint index = _residentIndex[resident];
        if(index < residents.length) {
            lib.Resident memory result = residents[index];
            if(result.wallet == resident) {
                result.nextPayment = _nextPayment[result.residence];
                return result;
            }
                
        }

        return lib.Resident({
            wallet: address(0),
            residence: 0,
            isCounselor: false,
            isManager: false,
            nextPayment: 0
        });
    }

    function getResidents(uint page, uint pageSize) external view returns(lib.ResidentPage memory) {
        uint resultSize = residents.length > pageSize ? pageSize : residents.length;

        lib.Resident[] memory result = new lib.Resident[](resultSize);
        uint skip = ((page - 1) * pageSize);
        uint index = 0;

        for (uint i = skip; i < resultSize; i++) {
            result[index++] = _getResident(residents[i].wallet);
        }

        return lib.ResidentPage({
            residents: result,
            totalCount: residents.length
        });
    }

    function isResident(address resident) public view returns (bool) {
        return _getResident(resident).residence > 0;
    }

    function residenceExists(uint16 residenceId) public view returns (bool) {
        return residences[residenceId];
    }

    function _addCounselor(address counselor) private onlyManager validAddress(counselor) {
        require(isResident(counselor), "O conselheiro precisa ser um morador");

        counselors.push(counselor);
        residents[_residentIndex[counselor]].isCounselor = true;
    }

    function _removeCounselor(address counselor) private onlyManager validAddress(counselor) {
        bool found = false;
        uint index = 0;
        uint lastIndex = counselors.length - 1;

        for (uint i = 0; i < counselors.length; i++) {
            if(counselors[i] == counselor) {
                index = i;
                found = true;
                break;
            }
        }

        require(found, "Conselheiro nao encontrado");

        if(index != lastIndex) {
            address latest = counselors[lastIndex];
            counselors[index] = latest;
        }

        counselors.pop();
        residents[_residentIndex[counselor]].isCounselor = false;
    }

    function setCounselor(address resident, bool isEntering) external {
        if (isEntering) {
            _addCounselor(resident);
        } 
        else {
            _removeCounselor(resident);
        }
    }

    function _isCounselor(address resident) private view returns(bool) {
        for (uint i = 0; i < counselors.length; i++) {
            if(counselors[i] == resident)
                return true;
        }

        return false;
    }

    function getTopic(string memory title) external view returns(lib.Topic memory) {
        return _getTopic(title);
    }

    function _getTopic(string memory title) private view returns(lib.Topic memory) {

        bytes32 topicId = getTopicId(title);
        uint index = _topicIndex[topicId];

        if(index < topics.length) {
            lib.Topic memory result = topics[index];
            if(index > 0 || topicId == getTopicId(result.title)) {
                return result;
            }
        }

        return lib.Topic({
            title: "",
            description: "",
            createDate: 0,
            startDate: 0,
            endDate: 0,
            amount: 0,
            responsible: address(0),
            status: lib.Status.DELETED,
            category: lib.Category.DECISION
        });
    }

    function getTopicId(string memory title) private  pure returns (bytes32 topicId) {
        topicId = keccak256(bytes(title));
    }

    function getTopics(uint page, uint pageSize) external view returns(lib.TopicPage memory) {
        return _getTopics(page, pageSize);
    }

    function _getTopics(uint page, uint pageSize) private view returns(lib.TopicPage memory) {
        uint resultSize = topics.length > pageSize ? pageSize : topics.length;

        lib.Topic[] memory result = new lib.Topic[](resultSize);
        uint skip = ((page - 1) * pageSize);
        uint index = 0;

        for (uint i = skip; i < resultSize; i++) {
            result[index++] = topics[i];
        }

        return lib.TopicPage({
            topics: result,
            totalCount: topics.length
        });
    }

    function topicExists(string memory title) public view returns(bool) {
        return _getTopic(title).createDate > 0;
    }

    function addTopic(string memory title, string memory description, lib.Category category, uint amount, address responsible) external onlyResident {
        require(!topicExists(title), "Topico ja existente");

        if(amount > 0) {
            require(
                category == lib.Category.SPENT || category == lib.Category.CHANGE_QUOTA,
                "Categoria invalida");
        }

        lib.Topic memory newTopic = lib.Topic({
            title: title,
            description: description,
            createDate: block.timestamp,
            startDate: 0,
            endDate: 0,
            status: lib.Status.IDLE,
            category: category,
            amount: amount,
            responsible: responsible != address(0) ? responsible : tx.origin
        });

        topics.push(newTopic);
        _topicIndex[getTopicId(title)] = topics.length - 1;
    }

    function editTopic(string memory topicToEdit, string memory description, uint amount, address responsible) 
        external onlyManager returns (lib.TopicUpdate memory) {
        
        lib.Topic memory topic = _getTopic(topicToEdit);

        require(topic.createDate > 0, "Topico inexistente");
        require(topic.status == lib.Status.IDLE, "Somente topicos com status IDLE podem ser editados");

        bytes32 topicId = getTopicId(topic.title);
        uint index = _topicIndex[topicId];


        if(bytes(description).length > 0)
            topics[index].description = description;
        
        if(amount > 0)
            topics[index].amount = amount;

        if(responsible != address(0))
            topics[index].responsible = responsible;

        return lib.TopicUpdate({
            id: topicId,
            title: topic.title,
            category: topic.category,
            status: topic.status
        });
    }

    function removeTopic(string memory title) 
        external onlyManager returns (lib.TopicUpdate memory) {

        lib.Topic memory topic = _getTopic(title);

        require(topic.createDate > 0, "Topico inexistente");
        require(topic.status == lib.Status.IDLE, "Este topico nao pode ser removido");

        bytes32 topicId = getTopicId(title);
        uint index = _topicIndex[topicId];
        uint latestIndex = topics.length - 1;

        if(index != latestIndex) {
            lib.Topic memory latest = topics[latestIndex];
            topics[index] = latest;
            _topicIndex[topicId] = index;
        }

        topics.pop();
        delete _topicIndex[topicId];

        return lib.TopicUpdate({
            id: getTopicId(title),
            title: topic.title,
            category: topic.category,
            status: lib.Status.DELETED
        });
    }

    function openVoting(string memory title) 
        external onlyManager returns (lib.TopicUpdate memory) {
        lib.Topic memory topic = _getTopic(title);
        require(topic.createDate > 0, "Topico inexistente");
        require(topic.status == lib.Status.IDLE, "Somente topicos ociosos podem ter a votacao iniciada");

        bytes32 topicId = getTopicId(title);
        uint index = _topicIndex[topicId];
        topics[index].status = lib.Status.VOTING;
        topics[index].startDate = block.timestamp;

        return lib.TopicUpdate({
            id: topicId,
            title: topic.title,
            category: topic.category,
            status: lib.Status.VOTING
        });
    }

    function vote(string memory title, lib.Options option) external onlyResident {
        require(option != lib.Options.EMPTY, "O Voto nao pode ser vazio");

        lib.Topic memory topic = _getTopic(title);
        require(topic.createDate > 0, "Topico inexistente");
        require(topic.status == lib.Status.VOTING, "Somente topicos em votacao podem ser votados");
    
        uint16 residence = residents[_residentIndex[tx.origin]].residence;
        bytes32 topicId = getTopicId(title);

        lib.Vote[] memory votes = _votings[topicId];
        for (uint i = 0; i < votes.length; i++) {
            require(votes[i].residence != residence, "Uma residencia so pode votar uma vez");
        }

        lib.Vote memory newVote = lib.Vote({
            residence: residence,
            resident: tx.origin,
            option: option,
            timestamp: block.timestamp
        });

        _votings[topicId].push(newVote);
    }

    function closeVoting(string memory title) 
        external onlyManager returns (lib.TopicUpdate memory) {
        lib.Topic memory topic = _getTopic(title);
        require(topic.createDate > 0, "Topico inexistente");
        require(topic.status == lib.Status.VOTING, "Somente topicos em votacao podem ser finalizados");

        uint minimumVotes = 5;

        if(topic.category == lib.Category.SPENT)
            minimumVotes = 10;
        else if(topic.category == lib.Category.CHANGE_MANAGER) 
            minimumVotes = 15;
        else if(topic.category == lib.Category.CHANGE_QUOTA)
            minimumVotes = 20;

        uint totalVotes = voteCount(title);
        require(totalVotes >= minimumVotes, "Esta votacao ainda nao atingiu a quantidade minima de votos para ser encerrada");

        uint8 yes = 0;
        uint8 no = 0;

        bytes32 topicId = getTopicId(title);
        lib.Vote[] memory votes = _votings[topicId];

        for (uint8 i = 0; i < votes.length; i++) {
            if(votes[i].option == lib.Options.YES)
                yes++;
            else if(votes[i].option == lib.Options.NO)
                no++;  
        }

        lib.Status newStatus = (yes > no) ? lib.Status.APPROVED : lib.Status.DENIED;

        uint index = _topicIndex[topicId];
        topics[index].status = newStatus;
        topics[index].endDate = block.timestamp;

        if(newStatus == lib.Status.APPROVED) {
            if(topic.category == lib.Category.CHANGE_QUOTA) {
                monthlyQuota = topic.amount;
            }
            else if (topic.category == lib.Category.CHANGE_MANAGER) {
                if(isResident(manager)) {
                    residents[_residentIndex[manager]].isManager = false;
                }
                
                manager = topic.responsible;

                if(isResident(topic.responsible)) {
                    residents[_residentIndex[topic.responsible]].isManager = true;
                }
            }
        }

        return lib.TopicUpdate({
            id: topicId,
            title: topic.title,
            category: topic.category,
            status: newStatus
        });
    }

    function getVotes(string memory topicTitle) external view returns(lib.Vote[] memory) {
        bytes32 topicId = getTopicId(topicTitle);

        return _votings[topicId];
    }

    function voteCount(string memory title) public view returns (uint) {
        bytes32 topicId = getTopicId(title);
        return _votings[topicId].length;
    }

    function getQuota() external view returns(uint) {
        return monthlyQuota;
    }

    function payQuota(uint16 residenceId) external payable {
        require(residenceExists(residenceId), "Esta residencia nao existe");
        require(msg.value >= monthlyQuota, "Valor invalido");
        require(block.timestamp > _nextPayment[residenceId], "Voce nao pode pagar duas vezes no mesmo mes");

        if(_nextPayment[residenceId] == 0) {
            _nextPayment[residenceId] = block.timestamp + _thirtyDays;
        }
        else {
            _nextPayment[residenceId] += _thirtyDays;
        }
    }

    function transfer(string memory topicTitle, uint amount) 
        external onlyManager  returns (lib.TransferReceipt memory) {
        require(address(this).balance >= amount, "Saldo insuficiente");

        lib.Topic memory topic = _getTopic(topicTitle);

        require(
                topic.status == lib.Status.APPROVED && topic.category == lib.Category.SPENT,
                "Somente topicos do tipo SPENT e Aprovados podem ser gastos");
        require(topic.amount >= amount, "O valor deve ser menor ou igual ao aprovado no topico");

        payable(topic.responsible).transfer(amount);

        bytes32 topicId = getTopicId(topicTitle);
        uint index = _topicIndex[topicId];
        topics[index].status = lib.Status.SPENT;

        return lib.TransferReceipt({
            to: topic.responsible,
            amount: amount,
            topic: topicTitle
         });
    }

    modifier onlyManager() {
        require(tx.origin == manager, "Somente o sindico pode executar esta operacao");
        _;
    }

    modifier onlyCouncil() {
        require(tx.origin == manager || _isCounselor(tx.origin), "Somente o sindico ou conselheiros podem executar esta operacao");
        _;
    }

    modifier onlyResident() {

        if(tx.origin != manager) {
            require(isResident(tx.origin), "Somente o sindico ou moradores podem executar esta operacao");
            
            lib.Resident memory resident = _getResident(tx.origin);
            require(block.timestamp <= resident.nextPayment, 
                "O morador deve estar adimplente");
        }        
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Endereco de carteira invalido");
        _;
    }
}
