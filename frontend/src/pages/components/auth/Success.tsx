import { AiOutlineSafetyCertificate } from "react-icons/ai";
import Loading from "../success/Loading";


export default function Success() {
    return (
        <div className="success">
            <AiOutlineSafetyCertificate className="icon_success" color="#5ACDA4"/>
            <h1 className="h_success">Two-Factor<br/>Authentication Verfied</h1>
            <p className="p_success">You are being redirected<Loading/></p>
        </div>
    );

}