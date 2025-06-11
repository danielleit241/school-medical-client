import React, { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { AiFillBell, AiOutlineFrown } from "react-icons/ai"; // icon đẹp

const SessionTimeout = () => {
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken"));
    const [showPrompt, setShowPrompt] = useState(false);
    const [showForceLogout, setShowForceLogout] = useState(false);
    const timerRef = useRef(null);
    const forceLogoutTimerRef = useRef(null);
    const navigate = useNavigate();
    const role = localStorage.getItem("role");
    const isLoggedIn = !!refreshToken && role === "parent";

    useEffect(() => {
        const handleStorage = () => {
            setRefreshToken(localStorage.getItem("refreshToken"));
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    useEffect(() => {
        setRefreshToken(localStorage.getItem("refreshToken"));
        //eslint-disable-next-line
    }, [localStorage.getItem("refreshToken")]);

    const resetTimer = () => {
        if (!isLoggedIn) return;
        clearTimeout(timerRef.current);
        clearTimeout(forceLogoutTimerRef.current);
        setShowPrompt(false);
        setShowForceLogout(false);

        timerRef.current = setTimeout(() => {
            setShowPrompt(true);
            forceLogoutTimerRef.current = setTimeout(() => {
                setShowForceLogout(true);
                setShowPrompt(false);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                setTimeout(() => {
                    navigate("/login");
                }, 2000); // Đợi 2 giây cho modal hiện ra
            }, 1000*5*60); // 5 phút trước khi force logout
        }, 1000*20*60); // 20 phút không hoạt động thì hỏi
    };

    useEffect(() => {
        if (!isLoggedIn) return;
        resetTimer();
        const events = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach((event) => window.addEventListener(event, resetTimer));
        return () => {
            events.forEach((event) => window.removeEventListener(event, resetTimer));
            clearTimeout(timerRef.current);
            clearTimeout(forceLogoutTimerRef.current);
        }
        //eslint-disable-next-line
    }, [isLoggedIn]);

    if (role !== "parent" || (!refreshToken && !showForceLogout)) return null;

    return (
        <>
            <Modal
                open={showPrompt}
                closable={false}
                footer={null}
                centered
                maskClosable={false}
                bodyStyle={{ textAlign: "center", padding: 32 }}
            >
                <div
                    className="shake-bell"
                    style={{
                        fontSize: 54,
                        color: "#faad14",
                        marginBottom: 16,
                        display: "inline-block",
                        animation: "shake 0.7s infinite"
                    }}
                >
                <AiFillBell />
                </div>
                <p style={{ fontWeight: 600, fontSize: 20, marginBottom: 24 }}>
                    Are you still there? <br />
                    <span style={{ fontWeight: 400 }}>If you are, please click or do something.</span>
                </p>
                <style>
                    {`
                        @keyframes shake {
                        0% { transform: rotate(-15deg);}
                        20% { transform: rotate(10deg);}
                        40% { transform: rotate(-10deg);}
                        60% { transform: rotate(8deg);}
                        80% { transform: rotate(-8deg);}
                        100% { transform: rotate(0deg);}
                        }
                    `}
                </style>
            </Modal>
            <Modal
                open={showForceLogout}
                closable={false}
                footer={null}
                centered
                maskClosable={true}
                onCancel={() => {
                    setShowForceLogout(false);
                    navigate("/login");
                }}
                bodyStyle={{ textAlign: "center", padding: 32 }}
            >
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 16 }}>
                    <div className="flip-icon" style={{ fontSize: 54, color: "#ff4d4f" }}>
                        <AiOutlineFrown />
                    </div>
                    
                </div>
                <p style={{ fontWeight: 600, fontSize: 20, color: "#ff4d4f" }}>
                    Please log in again. <br />
                    <span style={{ fontWeight: 400 }}>Your session has expired.</span>
                </p>
                <style>
                    {`
                    .flip-icon {
                        display: inline-block;
                        animation: flip 1s infinite linear;
                    }
                    .flip-delay {
                        animation-delay: 0.5s;
                    }
                    @keyframes flip {
                        0% { transform: rotateY(0deg);}
                        50% { transform: rotateY(180deg);}
                        100% { transform: rotateY(0deg);}
                    }
                    `}
                </style>
            </Modal>
        </>
    )
}

export default SessionTimeout;