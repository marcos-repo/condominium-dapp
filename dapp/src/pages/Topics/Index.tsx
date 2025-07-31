import { useEffect, useState } from "react";
import Alert from "../../components/Alert";
import Footer from "../../components/Footer";
import SideBar from "../../components/SideBar";
import { useLocation, useNavigate } from "react-router-dom";
import { getResidents, getTopics, removeResident, removeTopic, type Topic } from "../../services/Web3Service";
import Loader from "../../components/Loader";
import Pagination from "../../components/Pagination";
import { ethers, toNumber } from "ethers";
import TopicRow from "./TopicRow";

function Topics() {

    const navigate = useNavigate(); 
    const [topics, setTopics] = useState<Topic[]>([]);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [count, setCount] = useState<ethers.BigNumberish>(0);

    function clearMessages(){
        setMessage("");
        setError("");
    }
    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }

    function onDeleteTopic(title: string) {
        clearMessages();

        setIsLoading(true);

        //<TODO>: Adicionar um tratamento para realizar as exclusões de forma atômica
        const promiseBlockchain = removeTopic(title);
        //const promiseBackend = deleteApiResident(title);

        Promise.all([promiseBlockchain /*, promiseBackend*/])
            .then((tx) => {
                navigate("/topics?tx=" + tx[0].hash);
            })
            .catch((error) => setError(error.message))
            .finally(() => setIsLoading(false));
    }

    const query = useQuery();

    useEffect(() => {
        const page = parseInt(query.get("page") || "1");
        setIsLoading(true);
        getTopics(1, 20)
            .then((result)=> {
                setTopics(result.topics);
                setCount(toNumber(result.totalCount));
            })
            .catch((error) => {
                setError(error.message);
                console.error(error)
            })
            .finally(() => setIsLoading(false));

        const tx = query.get("tx");
        if(tx) {
            setMessage("Sua transação está sendo processada. Pode levar alguns minutos para propagação na rede");
        }
    }, []);

    

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
                            Tópicos
                        </h6>
                    </div>
                    </div>
                    <div className="card-body px-0 pb-2">
                    {
                        message ? 
                        <Alert alertClass="alert-success" materialIcon="thumb_up_off_alt" title="Sucesso!" text={message} />
                        : <></>
                    }
                    {
                        error ? 
                        <Alert alertClass="alert-danger" materialIcon="error" title="Erro!" text={error} />
                        : <></>
                    }
                    {
                        isLoading ? <Loader /> : <></>
                    }

                    <div className="table-responsive p-0">
                        <table className="table align-items-center mb-0">
                        <thead>
                            <tr>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Titulo</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Categoria</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Data</th>     
                                <th className="text-secondary opacity-7"></th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            topics && topics.length ?
                                topics.map(
                                    (topic) => <TopicRow key={topic.title} data={topic} onDelete={() => onDeleteTopic(topic.title)} />
                                ) :
                                <></>
                        }
                        </tbody>
                        </table>
                        <Pagination pageSize={20} count={count} />
                    </div>
                    <div className="row ms-2">
                        <div className="col-md-12 mb-3 mt-5">
                            <a className="btn bg-gradient-dark me-2" href="/topics/new">
                                <i className="material-icons opacity-10 me-2">add</i>
                                Novo tópico
                            </a>
                        </div>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            <Footer />
            </div>
        </main>
        </>
    )
}

export default Topics;