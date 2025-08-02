import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import SideBar from "../components/SideBar";
import { ethers } from "ethers";
import { getQuota, getResident, payQuota } from "../services/Web3Service";
import { getLoginAccount, getLoginData } from "../services/LoginData";

function Quota() {

    type QuotaModel = {
        quotaValue: ethers.BigNumberish;
        residence: number;
        nextPayment: number;
    }

    const [quota, setQuota] = useState<QuotaModel>({} as QuotaModel);
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    
    useEffect(() => {

        setIsLoading(true);

        const account = getLoginAccount() || "";
        const promiseResident = getResident(account);
        const promiseQuota = getQuota();

        Promise.all([promiseResident, promiseQuota])
        .then((result) => {
            quota.residence = result[0].residence;
            quota.nextPayment = result[0].nextPayment;
            quota.quotaValue = result[1];

            setQuota(quota);
        })
        .catch((error) => {
            setMessage(error.message);
        })
        .finally(() => {
            setIsLoading(false);
        });

    }, []);

    function onQuotaChange() {

    }

    function btnPayQuotaClick() {
        setIsLoading(true);
        setMessage("Conectando à blockchain...");

        payQuota(quota.residence, quota.quotaValue)
        .then(() => {
            
            setQuota(quota);
            setMessage("");
        })
        .catch((error) => {
            setMessage(error.message);
        })
        .finally(() => {
            setIsLoading(false);
        });
    }

    function getNextPayment() {
        const dateMs = ethers.toNumber(quota.nextPayment || 0) * 1000;
        const text = !dateMs ? "-" : new Date(dateMs).toLocaleDateString('pt-BR');
        return text;
    }
    

    function getNextPaymentClass() {
        let className = "input-group input-group-outline ";
        const dateMs = ethers.toNumber(quota.nextPayment || 0) * 1000;
        
        if(!dateMs || dateMs < Date.now())
            return className + "is-invalid";

        return className + "is-valid";
    }

    function getNextPaymentStatus() {
        const dateMs = ethers.toNumber(quota.nextPayment || 0) * 1000;
        
        if(!dateMs || dateMs < Date.now())
            return false;

        return true;
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
                                    <i className="material-icons opacity-10 me-2">payments</i>
                                    Cota Mensal
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
                                            <label htmlFor="value">Valor da Quota Mensal (ETH)</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="text" id="value" 
                                                    value={ethers.formatEther(quota.quotaValue)} onChange={onQuotaChange} disabled={true}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row ms-3">
                                    <div className="col-md-6 mb-3">
                                        <div className="form-group">
                                            <label htmlFor="residence">Número da Residência (ETH)</label>
                                            <div className="input-group input-group-outline">
                                                <input className="form-control" type="text" id="residence" 
                                                    value={quota.residence || 0} disabled={true}></input>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
                                {
                                    !getNextPaymentStatus() ?
                                    <>
                                        <div className="row ms-3">
                                            <div className="col-md-12 mb-3">
                                                <button className="btn bg-gradient-success me-2" onClick={btnPayQuotaClick}>
                                                    <i className="material-icons opacity-10 me-2">payments</i>
                                                    Efetuar Pagamento
                                                </button>
                                            </div>
                                        </div>
                                    </> : <></>
                                }
                            </div>
                        </div>
                        </div>
                    </div>
                    <Footer />
                </div>
            </main>
        </>
    );
}

export default Quota;