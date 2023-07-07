"use client"
import Link from "next/link";
import { useState, KeyboardEvent, useEffect } from "react";

import { VscSearch } from "react-icons/vsc";
import Profile_Frined from "./Profile_Frined";

function Friends({data}: any) { 
    const [visible, setvisible] = useState<boolean>(false);

    const [searchfriend, setsearchfriend] = useState<string>("");

    const [ListFriends, setListFriends] = useState<any>();
    const [Profile , setProfile] = useState<any>();

    useEffect( () => {
            fetch('http://localhost:3000/friends' , { credentials: "include" }).then((resp) => resp.json()).then((data) => setListFriends(data))
    }, [])
    const handelsearchChanges = (e: KeyboardEvent<HTMLInputElement>) =>
    {
        if (e.key === 'Enter')
        {
            setsearchfriend(e.currentTarget.value);
            console.log(e.currentTarget.value)
        }
    }

    return (
        <div className="cont overflow-hidden flex gap-[10px] h-[100%]" >
            <div className={`w-[40%] ${visible ? "xl:w-[0%] 2xl:w-[0%]" : "xl:w-[100%] 2xl:w-[100%]"} h-[100%] test5 flex flex-col items-center overflow-y-auto rounded-[10px]`}>
                                    <div className="w-[100%] h-auto flex flex-col items-center">
                                        <div className={`test5 w-[50%] h-[28px] flex justify-center items-center rounded-[15px] mt-[20px]`}>
                                            <div className="mr-[-5px]">
                                                <VscSearch className="w-[12px] h-[12px]" color="white" />
                                            </div>
                                            <input
                                                onKeyDown={handelsearchChanges}
                                                type="text"
                                                placeholder="Search friends"
                                                className="text-white text-[8px] font-sora font-[300] flex items-center bg-transparent  border-none outline-none pl-[20px] w-[70%]"
                                                />
                                            </div>
                                            <div className="w-[100%] h-[30px] mt-[20px] flex justify-center items-center">
                                                    <h1 className="font-[700] font-sora text-[11px] text-white">{`${data.info?.count_friends} Friends`}</h1>
                                            </div>

                                    </div>
                                        <div className="w-[100%] h-[100%] gap-[10px] flex flex-col">
                                            {ListFriends?.map((user: any, key: any) => (
                                                <div key={key} className="min-h-[61px] flex items-center">
                                                    <button onClick={ () => {
                                                        setvisible(false);
                                                        fetch('http://localhost:3000/profile/' + user.username , { credentials: "include" }).then((resp) => { return resp.json(); }).then((data) => {setProfile(data);setvisible(true);})
                                                        }} className="w-[75%] flex items-center justify-center">
                                                        <div className="w-[75px] h-[70px] flex justify-center items-start">
                                                            <img src={user.avatar} alt="" className="w-[54px] rounded-full select-none"/>
                                                            <div className={`w-[12px] h-[12px] bg-green mt-[45px] ml-[30px] rounded-full absolute ${visible ? '2xl:hidden xl:hidden': ''}`}></div>
                                                        </div>
                                                        <div className="w-[200px] h-[100%] flex flex-col justify-center items-start ml-[3%] mb-[5%]">
                                                            <h1 className="text-[13px] font-sora font-[600] text-[white]">{user.firstName + " " + user.lastName}</h1>
                                                            <h1 className="text-[10px] font-sora font-[400] text-[#969696] ">{"@" + user.username}</h1>
                                                        </div>
                                                    </button>
                                                    <button className="text-white ml-[18%] mb-[10px]">
                                                        ...
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                </div>
                {visible && <Profile_Frined setvisible={setvisible} data={data} ListFriends={ListFriends} Profile={Profile}/>}                        
        </div>
     );
}

export default Friends;