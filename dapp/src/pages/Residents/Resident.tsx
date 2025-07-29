import React, { useEffect, useState } from "react";
import SideBar from "../../components/SideBar";
import {addResident, getResident, Profile, setCounselor, type Resident} from "../../services/Web3Service";
import Footer from "../../components/Footer";
import SwitchInput from "../../components/SwitchInput";
import { useNavigate, useParams } from "react-router-dom";
import { isManager, isResident, logOut } from "../../services/LoginData";
import Loader from "../../components/Loader";
import { ethers } from "ethers";
import { addApiResident, getApiResident, updateApiResident, type ApiResident } from "../../services/ApiService";

function Resident() {
    
    const navigate = useNavigate();
    let { wallet } = useParams();

    const [resident, setResident] = useState<Resident>({} as Resident);
    const [apiResident, setApiResident] = useState<ApiResident>({} as ApiResident);

    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if(isResident()) {
            logOut();
            navigate("/");
        }

        if(wallet) {
            setIsLoading(true);

            const promiseBlockchain = getResident(wallet);
            const promiseBackend = getApiResident(wallet);

            Promise.all([promiseBlockchain, promiseBackend])
                .then((result) => {
                    setResident(result[0]);
                     setApiResident(result[1]);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }        
      }, [wallet]);

    function onResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setResident(prevState => ({
            ...prevState,
            [evt.target.id]: evt.target.value
        }));
    }

    function onApiResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setApiResident(prevState => ({
            ...prevState,
            [evt.target.id]: evt.target.value
        }));
    }

    function onResidentChange2(evt: React.ChangeEvent<HTMLInputElement>) {
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
                const promiseBlockchain = addResident(resident.wallet, resident.residence);
                const promiseBackend = addApiResident({...apiResident, profile: Profile.RESIDENT, wallet: resident.wallet});
                
                Promise.all([promiseBlockchain, promiseBackend])
                .then((result) => {
                    navigate("/residents?tx=" + result[0].hash);
                })
                .catch((error) => {
                    setMessage(error.message);
                })
                .finally(() => 
                    setIsLoading(false)
                );
            }
            else {
                const profile = resident.isCounselor ? Profile.COUNSELOR : Profile.RESIDENT;
                const promises = [];

                if(apiResident.profile !== profile) {
                    promises.push(setCounselor(resident.wallet, resident.isCounselor));
                }

                promises.push(updateApiResident(wallet, {...apiResident, profile, wallet}));
                
                Promise.all(promises)
                .then(() => {
                    navigate("/residents?tx=" + wallet);
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
                                    { wallet ? "Editar " : "Novo "} Morador
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
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="name">Nome</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="text" id="name" value={apiResident.name || ""}
                                                    onChange={onApiResidentChange}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="name">Telefone</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="tel" id="phone" value={apiResident.phone || ""}
                                                    placeholder="+5521999999999" onChange={onApiResidentChange}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="name">E-mail</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="email" id="email" value={apiResident.email || ""}
                                                    placeholder="email@email.com" onChange={onApiResidentChange}></input>
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
                                    wallet && isManager() ? 
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