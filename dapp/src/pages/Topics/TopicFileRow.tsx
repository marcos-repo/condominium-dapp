import { keccak256, toUtf8Bytes } from "ethers";
import { Status} from "../../services/Web3Service";
import { getToken, isManager } from "../../services/LoginData";

type Props = {
    topicTitle: string;
    fileName: string;
    status?: Status;
    onDelete: Function;
};



function TopicFileRow(props: Props) {

    function btnDeleteClick() {
        if(confirm("Confirma a exclusão deste arquivo?")){
            props.onDelete(props.fileName);
        }
    }

    function getTopicFileUrl() {
        const hash = keccak256(toUtf8Bytes(props.topicTitle));
        return `${import.meta.env.VITE_API_URL}/topicFiles/${hash}/${props.fileName}?token=${getToken()}`;
    }

    return (
        <>
            <tr>
                <td>
                    <p className="text-xs font-weight-bold mb-0 px-3">
                        <a href={getTopicFileUrl()} target="_blank">{props.fileName}</a>
                    </p>
                </td>
                <td className="align-middle">
                    <a href={getTopicFileUrl()} target="_blank" className="btn btn-success btn-sm me-1 mb-0">
                        <i className="material-icons text-sm">cloud_download</i>
                    </a>
                    
                    {
                        isManager() && props.status == Status.IDLE ? (
                            <>
                                <a href="#" className="btn btn-danger btn-sm me-1 mb-0" onClick={btnDeleteClick}>
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

export default TopicFileRow;