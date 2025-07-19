import { useEffect, useState } from "react";
import SideBar from "../components/SideBar";
import {getAddress, updagraContract} from "../services/Web3Service";
import Footer from "../components/Footer";

function Settings() {

    const [contract, setContract] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        setIsLoading(true);
        getAddress()
            .then((addr) => {
                setContract(addr);
            })
            .catch((error) => {
                setMessage(error.message);
            })
            .finally(() => {
                setIsLoading(false);
            }); 
      }, []);

    function btnSaveClick() {
        setMessage("Salvando configurações. Aguarde...");

        updagraContract(contract).then(() => {
            setMessage("Configurações salvas! Aguarde alguns instantes para serem propagadas pela rede.");
        })
        .catch((error) => {
            setMessage(error.message);
        });
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
                                    <i className="material-icons opacity-10 me-2">settings</i>
                                    Configurações
                                </h6>
                            </div>
                            </div>
                            <div className="card-body px-0 pb-2">
                                {
                                    isLoading ? 
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <p>
                                                    <i className="material-icons opacity-10 me-2">hourglass_empty</i>
                                                    Carregando...
                                                </p>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="adapter">Adapter Address</label>
                                            <input className="form-control" type="text" id="adapter" value={import.meta.env.VITE_CONTRACT_ADDRESS} disabled={true}></input>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="contract">Contract Address</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="text" id="contract" value={contract}
                                                    onChange={e => setContract(e.target.value)}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-12 mb-3">
                                        <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                            <i className="material-icons opacity-10 me-2">save</i>
                                            Salvar Configurações
                                        </button>
                                        <span className="text-danger">
                                            {message}
                                        </span>
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

export default Settings;