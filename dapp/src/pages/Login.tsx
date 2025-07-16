import { useNavigate } from 'react-router-dom'
import { login } from '../services/Web3Service.ts';
import { useState } from 'react';

function Login() {

  const navigate = useNavigate();
  const [message, setMessage] = useState<string>("");

  function btnLoginClick() {
    login()
      .then(() => {
        navigate("/topics");
      })
      .catch((error) => {
        setMessage(error.message);
      });    
  }

  return (    
    <main className="main-content  mt-0">
      <div className="page-header align-items-start min-vh-100" style={{backgroundImage: "url('https://images.unsplash.com/photo-1635127003480-02502857f8e5?q=80&w=870&auto=format&fit=crop&')"}}>
        <span className="mask bg-gradient-dark opacity-6"></span>
        <div className="container my-auto">
          <div className="row">
            <div className="col-lg-4 col-md-8 col-12 mx-auto">
              <div className="card z-index-0 fadeIn3 fadeInBottom">
                <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                  <div className="bg-gradient-primary shadow-primary border-radius-lg py-3 pe-1">
                    <h4 className="text-white font-weight-bolder text-center mt-2 mb-0">Condominium DAO</h4>
                    
                  </div>
                </div>
                <div className="card-body">
                  <form role="form" className="text-start">
                    <div className="text-center">
                      <img src="/assets/images/logo192.png" alt="Condominium Logo" />
                    </div>
                    <div className="text-center">
                      <button type="button" className="btn bg-gradient-primary w-100 my-4 mb-2" onClick={btnLoginClick}>
                        <img src="/assets/images/metamask.svg" alt="Metamas Logo" width="48" className="me-2" />
                        Autenticar com MetaMask
                      </button>
                    </div>
                    <p className="mt-4 text-sm text-center text-danger">
                     {message}
                    </p>
                    <p className="mt-4 text-sm text-center">
                     Não tem uma conta? Fale com o {' '}
                      <a href="" className="text-primary text-gradient font-weight-bold ">Síndico</a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  )
}

export default Login
