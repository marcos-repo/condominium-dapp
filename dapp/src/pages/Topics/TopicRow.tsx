import { ethers } from "ethers";
import { getCategory, Status, type Category, type Topic } from "../../services/Web3Service";
import { isManager } from "../../services/LoginData";

type Props = {
    data: Topic;
    onDelete: Function;
};



function TopicRow(props: Props) {

    function getDate() {
        if(!props.data.createDate)
            return "-";

        const dateMs = ethers.toNumber(props.data.createDate) * 1000;
       
        return (
            <span className={"text-xs mb-0 ms-3 "}>
                {new Date(dateMs).toLocaleDateString('pt-BR')}
            </span>
        );

    }

    function _getCategory(category: Category) {
        //a categoria está vindo da blockchain como bigInt
        const text = getCategory(Number(category));

        return <p className="text-xs font-weight-bold mb-0 px-3">{text}</p>
    }

    function getStatus(status: Status) {
        let text = "", className = "badge py-1 ms-3 ";

        //o status está vindo da blockchain como bigInt
        switch(Number(status)) {
            case Status.VOTING: 
                text = "EM VOTAÇÃO";
                className += "bg-warning";
                break;
            case Status.APPROVED: 
                text =  "APROVADO";
                className += "bg-success";
                break;
            case Status.DELETED: 
                text = "REMOVIDO";
                className += "bg-danger";
                break;
            case Status.DENIED: 
                text = "NEGADO";
                className += "bg-danger";
                break;
            case Status.SPENT: 
                text = "GASTO";
                className += "bg-success";
                break;
            default: 
                text = "AGUARDANDO";
                className += "bg-secondary";
        }

        return <span className={className}>{text}</span>
    }
    
    

    function btnDeleteClick() {
        if(confirm("Confirma a exclusão deste tópico?")){
            props.onDelete(props.data.title);
        }
    }

    return (
        <>
            <tr>
                <td>
                    <div className="d-flex px-3 py-1">
                        <div className="d-flex flex-column justify-content-center">
                            <h6 className="mb-0 text-sm">{props.data.title}</h6>
                        </div>
                    </div>
                </td>
                <td>
                    {_getCategory(props.data.category)}
                </td>
                <td>
                    <p className="text-xs font-weight-bold mb-0 px-3">{getStatus(props.data.status || 0)}</p>
                </td>
                <td>
                    <p className="text-xs font-weight-bold mb-0 px-3">{getDate()}</p>
                </td>
                <td className="align-middle">
                    <a href={"/topics/edit/" + props.data.title} className="btn btn-info btn-sm me-1">
                        <i className="material-icons text-sm">visibility</i>
                    </a>
                    
                    {
                        isManager() && props.data.status == Status.IDLE ? (
                            <>
                                <a href="#" className="btn btn-danger btn-sm me-1" onClick={btnDeleteClick}>
                                    <i className="material-icons text-sm">delete</i>
                                </a>
                            </>
                        )
                        :<></>
                    }
                </td>
            </tr>
        </>
    );
}

export default TopicRow;