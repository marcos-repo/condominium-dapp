import React, { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import {addResident, getResident, setCounselor, type Resident} from "../../services/Web3Service";
import Footer from "../../components/Footer";
import SwitchInput from "../../components/SwitchInput";
import { useNavigate, useParams } from "react-router-dom";
import { isManager, isResident, logOut } from "../../services/LoginData";
import Loader from "../../components/Loader";
import { ethers } from "ethers";

function Resident() {
    
    const navigate = useNavigate();
    let { wallet } = useParams();

    const [resident, setResident] = useState<Resident>({} as Resident);

    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if(isResident()) {
            logOut();
            navigate("/");
        }

        if(wallet) {
            setIsLoading(true);

            getResident(wallet)
                .then((resident) => {
                    setResident(resident);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
        
      }, [wallet]);

    function onResidentChange2(evt: React.ChangeEvent<HTMLInputElement>) {
        setResident(prevState => ({
            ...prevState,
            [evt.target.id]: evt.target.value
        }));
    }

    function onResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {
        const { id, value } = evt.target;

        setResident(prevState => {
            const parsedValue = id === "isCounselor" ? value === "true" : value;
            return {
                ...prevState,
                [id]: parsedValue,
                wallet: prevState.wallet ?? "",
                residence: prevState.residence ?? ""
                };
        });
    }

    function btnSaveClick() {
        if(resident) {
            setIsLoading(true);
            setMessage("Conectando a carteira. Aguarde...");

            if(!wallet) {
                addResident(resident.wallet, resident.residence)
                .then((tx) => {
                    navigate("/residents?tx=" + tx.hash);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => 
                    setIsLoading(false)
                );
            }
            else {
                console.log(resident);
                setCounselor(resident.wallet, resident.isCounselor)
                .then((tx) => {
                    navigate("/residents?tx=" + tx.hash);
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

    function getNextPayment() {
        const dateMs = ethers.toNumber(resident.nextPayment || 0) * 1000;
        const text = !dateMs ? "-" : new Date(dateMs).toDateString();
        return text;
    }

    function getNextPaymentClass() {
        let className = "input-group input-group-outline ";
        const dateMs = ethers.toNumber(resident.nextPayment || 0) * 1000;
        
        if(!dateMs || dateMs < Date.now())
            return className + "is-invalid";

        return className + "is-valid";
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
                                    <i className="material-icons opacity-10 me-2">group</i>
                                    Moradores
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
                                            <label htmlFor="wallet">Wallet Address</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="text" id="wallet" value={resident.wallet || ""}
                                                    placeholder="0x00..." onChange={onResidentChange} disabled={!!wallet}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="residence">Número da Residência</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="number" id="residence" value={resident.residence || ""}
                                                    placeholder="1101" onChange={onResidentChange} disabled={!!wallet}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {
                                    wallet ? 
                                    <>
                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label htmlFor="nextPayment">Próximo Pagamento</label>
                                                <div className={getNextPaymentClass()}>
                                                    <input className="form-control" type="text" id="nextPayment" value={getNextPayment()}
                                                        disabled={true}></input>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    </>:<></>
                                }

                                {
                                    isManager() ? 
                                    <>
                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <SwitchInput 
                                                    id="isCounselor" 
                                                    text="Membro do Conselho" 
                                                    isChecked={resident.isCounselor || false} 
                                                    onChange={onResidentChange} />
                                            </div>
                                        </div>
                                    </div>
                                    </>:<></>
                                }

                                <div className="row ms-3">
                                    <div className="col-md-12 mb-3">
                                        <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                            <i className="material-icons opacity-10 me-2">save</i>
                                            Salvar Informações
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

export default Resident;