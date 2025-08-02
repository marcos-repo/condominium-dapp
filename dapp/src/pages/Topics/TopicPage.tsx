import React, { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import Footer from "../../components/Footer";
import { useNavigate, useParams } from "react-router-dom";
import Loader from "../../components/Loader";
import { ethers } from "ethers";
import { addTopic, Category, closeVoting, compareEthAccounts, editTopic, getStatus, getTopic, getVotes, openVoting, Options, Status, transfer, vote, type Topic, type Vote } from "../../services/Web3Service";
import TopicCategory from "../../components/TopicCategory";
import { getLoginAccount, isManager } from "../../services/LoginData";
import TopicFiles from "./TopicFiles";

function TopicPage() {
    
    const navigate = useNavigate();
    let { title } = useParams();

    const [topic, setTopic] = useState<Topic>({} as Topic);
    const [votes, setVotes] = useState<Vote[]>([]);
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    
    const [status, setStatus] = useState<Status>(0);

    useEffect(() => {
        if(title) {
            setIsLoading(true);

            const topicPromise = getTopic(title);

            Promise.all([topicPromise])
                .then((result) => {
                    setTopic(result[0]);
                    const _status = Number(result[0].status);           
                    setStatus(_status);

                    if(_status !== Status.IDLE && _status !== Status.DELETED) {
                        return getVotes(title);
                    }                        
                })
                .then((v) => {
                    setVotes(v || []);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }   
        else {
            topic.responsible = getLoginAccount() || "";
        }   
        
        
      }, [title]);


    function getAmount(): string{
        return topic.amount ? topic.amount.toString() : "0";
    }

    function showResponsible(): boolean {
        const category = parseInt(`${topic.category}`);
        return [Category.CHANGE_MANAGER, Category.SPENT].includes(category);
    }
    
    function showAmount(): boolean {
        const category = parseInt(`${topic.category}`);
        return [Category.CHANGE_QUOTA, Category.SPENT].includes(category);
    }

    // function isClosed(): boolean {
    //     const status = parseInt(`${topic.status || 0}`);
    //     return [Status.APPROVED, Status.DENIED, Status.DELETED, Status.SPENT].includes(status);
    // }

    function onTopicChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setTopic(prevState => ({
            ...prevState,
            [evt.target.id]: evt.target.value
        }));
    }

    function isDisabled() {
        return !isManager() && topic.status !== Status.IDLE && !!title;
    }

    function btnSaveClick() {
        if(topic) {
            setIsLoading(true);
            setMessage("Conectando a carteira. Aguarde...");
            if(!title) {
                const promiseBlockchain = addTopic(topic);
                //const promiseBackend = addApiTopic();
                
                setMessage("Salvando informações");
                Promise.all([promiseBlockchain])
                .then((result) => {
                    navigate("/topics?tx=" + result[0].hash);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => 
                    setIsLoading(false)
                );
            }
            else {
                
                const promiseBlockchain = editTopic(title, topic.description, topic.amount, topic.responsible);
                
                setMessage("Salvando informações");
                Promise.all([promiseBlockchain])
                .then((result) => {
                    navigate("/topics?tx=" + result[0].hash);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => 
                    setIsLoading(false)
                );
            }
        }
    }

    function btnOpenVotingClick() {
        setIsLoading(true);
        setMessage("Conectando a carteira. Aguarde...");
        const promiseBlockchain = openVoting(topic.title);
        Promise.all([promiseBlockchain])
        .then((result) => {
            navigate("/topics?tx=" + result[0].hash);
        })
        .catch((error) => {
            setMessage(error.message);
        })
        .finally(() => 
            setIsLoading(false)
        );

    }

    function btnCloseVotingClick() {
       setIsLoading(true);
        setMessage("Conectando a carteira. Aguarde...");
        const promiseBlockchain = closeVoting(topic.title);
        //const promiseBackend = addApiTopic();
        Promise.all([promiseBlockchain])
        .then((result) => {
            navigate("/topics?tx=" + result[0].hash);
        })
        .catch((error) => {
            setMessage(error.message);
        })
        .finally(() => 
            setIsLoading(false)
        );
    }

    function btnVoteClick(option: Options) {
        setIsLoading(true);
        let voto = "";
        switch (option) {
            case Options.YES:
                voto = "Sim"
                break;
            case Options.NO:
                voto = "Não"
                break;
        
            default:
                voto = "Abster-se"
                break;
        }

        if(window.confirm(`Confirma o Voto '${voto}' para o tópico '${topic.title}'?`)) {
            setMessage("Conectando a carteira. Aguarde...");

            vote(topic.title, option)
            .then((result) => {
                navigate("/topics?tx=" + result.hash);
            })
            .catch((error) => {
                setMessage(error.message);
            })
            .finally(() => 
                setIsLoading(false)
            );
        }
        else {
            setMessage("");
        }
    }

    function getDate(timestamp: ethers.BigNumberish) {
         const dateMs = ethers.toNumber(timestamp || 0) * 1000;
        const text = !dateMs ? "-" : new Date(dateMs).toLocaleDateString('pt-BR');
        return text;
    }

    function alreadyVoted() {
        const account = getLoginAccount() || "";

        return votes && votes.length && 
                    votes.find(x => compareEthAccounts(x.resident, account));
    }

    function getVotingScore() {
        const yes = votes.filter(x => x.option == Options.YES).length;
        const no = votes.filter(x => x.option == Options.NO).length;
        const abs = votes.filter(x => x.option == Options.ABSTENTION).length;

        return `SIM: ${yes} - ABSTENÇÃO: ${abs} - NÃO: ${no}`;
    }

    function btnTransferClick() {
        //if(1===1 || isManager() && status == Status.APPROVED && topic.category == Category.SPENT) {
            if(confirm(`Confirma a transferência de ${topic.amount} ETH para o carteira ${topic.responsible}?`)) {

                transfer(topic.title, topic.amount)
                .then((result) => {
                    navigate("/topics?tx=" + result.hash);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => 
                    setIsLoading(false)
                );
            }
        //}
    }

    return (
        <>
            <SideBar />
            <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                <div className="container-fluid py-4">
                    <div className="row">
                        <div className="col-12">
                        <div className="card my-4">
                            <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                            <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                                <h6 className="text-white text-capitalize ps-3">
                                    <i className="material-icons opacity-10 me-2">interests</i>
                                    { title ? "Editar " : "Novo "} Tópico
                                </h6>
                            </div>
                            </div>
                            <div className="card-body px-0 pb-2">
                                {
                                    isLoading ? <Loader /> : <></>
                                }
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="title">Título</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="text" id="title" value={topic.title || ""}
                                                    placeholder="Título" onChange={onTopicChange} disabled={!!title}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="description">Descrição</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="text" id="description" value={topic.description || ""}
                                                    placeholder="..." onChange={onTopicChange} disabled={isDisabled()}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="category">Categoria</label>
                                            <div className="input-group input-group-outline">
                                                <TopicCategory value={topic.category?.toString() || ""} disabled={!!title} onChange={onTopicChange} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {
                                    title ? 
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="status">Status</label>
                                                    <div className="input-group input-group-outline">
                                                        <input className="form-control" type="text" id="status" value={getStatus(status) || ""}
                                                            onChange={onTopicChange} disabled={true}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                                {
                                    showResponsible() ?
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="responsible">Responsável</label>
                                                    <div className="input-group input-group-outline">
                                                        <input className="form-control" type="text" id="responsible" value={topic.responsible || ""}
                                                            placeholder="0x00.." onChange={onTopicChange} disabled={isDisabled()}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                                {
                                    showAmount() ?
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="amount">Valor</label>
                                                    <div className="input-group input-group-outline">
                                                        <input className="form-control" type="number" id="amount" value={getAmount()}
                                                            placeholder="0" onChange={onTopicChange} disabled={isDisabled()}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <></>
                                }

                                {
                                    topic.createDate ? 
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="createdDate">Data de Criação</label>
                                                    <div className="input-group input-group-outline">
                                                        <input className="form-control" type="text" id="createdDate" value={getDate(topic.createDate || 0)}
                                                            disabled={true}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                                {
                                    topic.startDate ? 
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="startDate">Início da Votação</label>
                                                    <div className="input-group input-group-outline">
                                                        <input className="form-control" type="text" id="startDate" value={getDate(topic.startDate || 0)}
                                                            disabled={true}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                                {
                                    topic.endDate ? 
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="endDate">Início da Votação</label>
                                                    <div className="input-group input-group-outline">
                                                        <input className="form-control" type="text" id="endDate" value={getDate(topic.endDate || 0)}
                                                            disabled={true}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                                {
                                    votes && votes.length ? 
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="endDate">Placar da Votação</label>
                                                    <div className="input-group input-group-outline">
                                                        <input className="form-control" type="text" id="endDate" value={getVotingScore()}
                                                            disabled={true}></input>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                                <div className="row ms-3">
                                    <div className="col-md-12 mb-3">
                                        {
                                            !title || (isManager() && status == Status.IDLE)? 
                                            <>
                                                <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                                    <i className="material-icons opacity-10 me-2">save</i>
                                                    Salvar Informações
                                                </button>
                                                <button className="btn bg-gradient-success me-2" onClick={btnOpenVotingClick}>
                                                    <i className="material-icons opacity-10 me-2">lock_open</i>
                                                    Abrir Votação
                                                </button>
                                            </> : <></>
                                        }
                                        {
                                            !title || (isManager() && status == Status.VOTING)? 
                                            <>
                                                <button className="btn bg-gradient-danger me-2" onClick={btnCloseVotingClick}>
                                                    <i className="material-icons opacity-10 me-2">lock</i>
                                                    Encerrar Votação
                                                </button>
                                            </> : <></>
                                        }
                                        {
                                            !alreadyVoted() && title && status == Status.VOTING ? 
                                            <>
                                                <button className="btn bg-gradient-success me-2" onClick={()=> btnVoteClick(Options.YES)}>
                                                    <i className="material-icons opacity-10 me-2">thumb_up</i>
                                                    Sim
                                                </button>
                                                <button className="btn bg-gradient-warning me-2" onClick={()=> btnVoteClick(Options.ABSTENTION)}>
                                                    <i className="material-icons opacity-10 me-2">thumbs_up_down</i>
                                                    Abster-se
                                                </button>
                                                <button className="btn bg-gradient-danger me-2" onClick={()=> btnVoteClick(Options.NO)}>
                                                    <i className="material-icons opacity-10 me-2">thumb_down</i>
                                                    Não
                                                </button>
                                            </> : <></>
                                        }
                                        {
                                            1===1 || isManager() && status == Status.APPROVED && topic.category == Category.SPENT ? 
                                            <>
                                                <button className="btn bg-gradient-dark me-2" onClick={btnTransferClick}>
                                                    <i className="material-icons opacity-10 me-2">payments</i>
                                                    Transferir Pagamento
                                                </button>
                                            </> : <></>
                                        }
                                        <span className="text-danger">
                                            {message}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    {
                        title ? 
                            <TopicFiles title={title || ""} status={status} /> :
                            <></>
                    }
                    <Footer />
                </div>
            </main>
        </>
    )
}

export default TopicPage;