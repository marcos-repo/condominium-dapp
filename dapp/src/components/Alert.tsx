
type Props = {
    title: string;
    text: string;
    materialIcon: string;
    alertClass: string;
};

/**
 * props:
 * - title
 * - text
 * - materialIcon
 * - alertClass
 */
function Alert(props: Props) {
    return(<>
        <div className={"alert " + props.alertClass + " alert-dismissible text-white fade show mx-3"} role="alert">
        {
            props.materialIcon ? (
            <span className="alert-icon align-middle">
                <span className="material-icons text-sm me-2">
                    {props.materialIcon}
                </span>
            </span> ) : 
            <></>
        }
        <span className="alert-text"><strong>{props.title}</strong> { props.text }</span>
        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    </>);
}

export default Alert;