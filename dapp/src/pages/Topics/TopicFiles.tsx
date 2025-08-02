import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { Status } from "../../services/Web3Service";
import TopicFileRow from "./TopicFileRow";
import { deleteTopicFiles, getTopicFiles, uploadTopicFile } from "../../services/ApiService";


type Props = {
    title: string;
    status: Status;
};



function TopicRow(props: Props) {

    useEffect(() => {
        loadFiles();
    },[]);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [files, setFiles] = useState<string[]>([]);
    const [newFile, setNewFile] = useState<File>();
    const [uploadMessage, setUploadMessage] = useState<string>("");

    function onDeleteFile(fileName: string) {
        if(props.status !== Status.IDLE) {
            return setUploadMessage("Este arquivo não pode ser deletado.");
        }

        setIsLoading(true);
        setUploadMessage("Deletando arquivo...");
        deleteTopicFiles(props.title, fileName)
            .then(() => {
                setUploadMessage("");
                loadFiles();
            })
            .catch((error) => {
                setUploadMessage(error.response ? error.response.data : error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    function onFileChange(evt: React.ChangeEvent<HTMLInputElement>) {
        if(evt.target.files) {
            setNewFile(evt.target.files[0]);
        }
    }

    function loadFiles() {
        setIsLoading(true);
        getTopicFiles(props.title)
            .then((files) => {
                setFiles(files);
            })
            .catch((error) => {
                setFiles([]);
                setUploadMessage(error.response ? error.response.data : error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    function btnUploadClick() {

        if(!newFile) 
            return;

        setIsLoading(true);
        setUploadMessage("Enviando arquivo...");

        uploadTopicFile(props.title, newFile)
            .then(() => {
                setNewFile(undefined);
                setUploadMessage("");
                loadFiles();
            })
            .catch((error) => {
                setUploadMessage(error.response ? error.response.data : error.message);
            })
            .finally(()=> {
                setIsLoading(false);
            })
    }

    return (
        <>
            <div className="row">
                <div className="col-12">
                <div className="card my-4">
                    <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                    <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                        <h6 className="text-white text-capitalize ps-3">
                            <i className="material-icons opacity-10 me-2">cloud_upload</i>
                            Documentos
                        </h6>
                    </div>
                    </div>
                    <div className="card-body px-0 pb-2">
                    {
                        isLoading ? <Loader /> : <></>
                    }

                    <div className="table-responsive p-0">
                        <table className="table align-items-center mb-0">
                        <thead>
                            <tr>
                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Nome do Arquivo</th>
                                <th className="text-secondary opacity-7"></th>
                            </tr>
                        </thead>
                        <tbody>
                        {
                            files && files.length ?
                                files.map(
                                    (file) => <TopicFileRow key={file} fileName={file} topicTitle={props.title} 
                                                            status={props.status} onDelete={() => onDeleteFile(file)} />
                                ) :
                                (
                                    <tr>
                                        <td colSpan={2} className="text-xs font-weight-bold mb-0 px-4">
                                            Não existem arquivos para este tópico
                                        </td>
                                    </tr>
                                )
                        }
                        </tbody>
                        </table>
                        <hr />
                    </div>

                    {
                        props.status === Status.IDLE ? 
                        <>
                            <div className="row ms-2">
                                <div className="col-md-6 mb-3 mt-5 ms-3">
                                    <div className="form-group">
                                        <h6>Upload de Arquivos</h6>
                                        <div className="input-group input-group-outline">
                                            <input className="form-control" type="file" id="newFile" 
                                                onChange={onFileChange}></input>

                                            <button className="btn bg-gradient-dark mb-0" onClick={btnUploadClick}>
                                                 <i className="material-icons opacity-10 me-2">cloud_upload</i>
                                                 Upload
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mt-5 ms-3 text-danger">
                                    {uploadMessage}
                                </div>
                            </div>
                        </> : <></>
                    }
                    </div>
                </div>
                </div>
            </div>
        </>
    );
}

export default TopicRow;