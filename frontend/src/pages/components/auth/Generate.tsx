export default function Generate() {
    return (
        <div className="w-[378px] h-[543px] bg-white absolute top-1/4 left-[20%] rounded-[15px]">
            <div className="w-[100%] h-[157px] flex items-center justify-center">
                <div className="w-[342px] h-[65px]">
                    <p className="font-lato font-medium text-[16px] leading-[19px] text-[#414243]">You need to scan this QR Code with your google Authentication App and enter the verification code bellow</p>
                </div>
            </div>
            <div className="w-[100%] h-[115px] flex items-end justify-center">
                <div className="w-[288px] h-[100%] rounded-[10px] border border-[#414243] flex items-center justify-center">
                    <img  className="w-[96px] h-[96px]" src="rr.png" alt="" />
                </div>
            </div>
        </div>
    );
}