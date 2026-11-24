import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, Hand, MessageSquare, 
  Users, PhoneOff, Maximize, Signal, Shield, Send
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { sendDesktopNotification, toggleLiveFullscreen } from '../services/desktop';

interface BuiltInClassroomProps {
  classTitle: string;
  onLeave: () => void;
}

export const BuiltInClassroom: React.FC<BuiltInClassroomProps> = ({ classTitle, onLeave }) => {
  const { user } = useAuth();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Instructor', text: 'Welcome to EDU CLICK Live Classroom. Please check your audio and mic.', time: '08:30 AM' }
  ]);
  const [inputText, setInputText] = useState('');
  const [participantsCount, setParticipantsCount] = useState(24);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize camera preview & WebSocket connection
  useEffect(() => {
    sendDesktopNotification('EDU CLICK Live Classroom', `Joined session: ${classTitle}`);

    let stream: MediaStream | null = null;
    navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
      .then((s) => {
        stream = s;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = s;
        }
      })
      .catch((err) => {
        console.warn('Camera/Mic permission not granted or device not attached:', err);
      });

    // Connect to backend WebSocket hub
    try {
      const socket = new WebSocket(`ws://${window.location.hostname}:5000`);
      wsRef.current = socket;
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CHAT') {
            setMessages((prev) => [...prev, { sender: data.sender, text: data.text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
          }
        } catch (e) {}
      };
    } catch (e) {
      console.warn('WebSocket connection fallback', e);
    }

    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      wsRef.current?.close();
    };
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      sender: user?.fullName || 'Student',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, newMsg]);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'CHAT', ...newMsg }));
    }
    setInputText('');
  };

  const toggleHandRaise = () => {
    setHandRaised(!handRaised);
    if (!handRaised) {
      setMessages((prev) => [
        ...prev,
        { sender: 'System', text: `${user?.fullName || 'Student'} raised their hand.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B132B] text-white flex flex-col">
      
      {/* Top Header */}
      <div className="h-16 bg-[#142B4F] border-b border-blue-900/40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          <div>
            <h3 className="font-bold text-sm text-white tracking-wide truncate max-w-xs sm:max-w-md">{classTitle}</h3>
            <p className="text-[11px] text-[#14B8A6] font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> High-Definition WebRTC Live Classroom
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 rounded-full border border-blue-800 text-xs text-slate-300">
            <Signal className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Optimal (24ms)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/80 rounded-full border border-blue-800 text-xs text-slate-300">
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>{participantsCount} Participants</span>
          </div>

          <button
            onClick={onLeave}
            className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </div>

      {/* Center Video Area & Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Main Stage */}
        <div className="flex-1 p-4 flex flex-col gap-4 relative">
          
          {/* Main Presenter Screen */}
          <div className="flex-1 rounded-2xl bg-gradient-to-br from-slate-900 to-[#142B4F] border border-blue-900/40 relative overflow-hidden flex items-center justify-center shadow-2xl">
            <div className="text-center p-6 space-y-4">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#142B4F] border-4 border-[#2563EB] flex items-center justify-center shadow-lg">
                <span className="font-black text-3xl text-white">EDU</span>
              </div>
              <h2 className="text-xl font-bold text-white">{classTitle}</h2>
              <p className="text-sm text-[#14B8A6] font-medium">Instructor is presenting live on the shared digital whiteboard</p>
              {handRaised && (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold animate-bounce">
                  <Hand className="w-4 h-4" /> Hand Raised
                </div>
              )}
            </div>

            {/* Picture-in-Picture Local User Video */}
            <div className="absolute bottom-4 right-4 w-48 h-32 rounded-xl bg-black border-2 border-blue-500 overflow-hidden shadow-2xl">
              {isVideoOn ? (
                <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-xs">
                  <VideoOff className="w-6 h-6 mb-1 text-slate-500" />
                  <span>Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-1 left-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                You ({user?.fullName ? user.fullName.split(' ')[0] : 'Student'})
              </div>
            </div>
          </div>

          {/* Bottom Floating Controls */}
          <div className="h-16 bg-[#142B4F]/90 backdrop-blur-md rounded-2xl border border-blue-900/60 px-6 flex items-center justify-center gap-3 shadow-xl">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-xl transition-all ${isMicOn ? 'bg-slate-700/80 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'}`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-xl transition-all ${isVideoOn ? 'bg-slate-700/80 hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'}`}
              title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={async () => {
                if (!isScreenSharing) {
                  try {
                    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    setIsScreenSharing(true);
                    displayStream.getVideoTracks()[0].onended = () => setIsScreenSharing(false);
                  } catch (e) {
                    console.warn('Screen share permission denied or cancelled', e);
                  }
                } else {
                  setIsScreenSharing(false);
                }
              }}
              className={`p-3 rounded-xl transition-all ${isScreenSharing ? 'bg-[#14B8A6] text-white' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
              title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
            >
              <Monitor className="w-5 h-5" />
            </button>

            <button
              onClick={toggleLiveFullscreen}
              className="p-3 rounded-xl bg-slate-700/80 hover:bg-slate-600 text-white transition-all"
              title="Toggle Desktop Fullscreen"
            >
              <Maximize className="w-5 h-5" />
            </button>

            <button
              onClick={toggleHandRaise}
              className={`p-3 rounded-xl transition-all ${handRaised ? 'bg-amber-500 text-white animate-pulse' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
              title="Raise Hand"
            >
              <Hand className="w-5 h-5" />
            </button>

            <button
              onClick={() => setChatOpen(!chatOpen)}
              className={`p-3 rounded-xl transition-all ${chatOpen ? 'bg-[#2563EB] text-white' : 'bg-slate-700/80 hover:bg-slate-600 text-white'}`}
              title="Classroom Chat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Chat Drawer */}
        {chatOpen && (
          <div className="w-80 bg-[#142B4F] border-l border-blue-900/60 flex flex-col">
            <div className="p-4 border-b border-blue-900/60 flex items-center justify-between">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#14B8A6]" /> Live Class Chat
              </h4>
              <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, idx) => (
                <div key={idx} className="bg-blue-950/70 p-3 rounded-xl border border-blue-900/40 space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-[#14B8A6] font-bold">
                    <span>{m.sender}</span>
                    <span className="text-slate-400 font-normal">{m.time}</span>
                  </div>
                  <p className="text-xs text-slate-200">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-blue-900/60 flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask teacher a question..."
                className="flex-1 bg-blue-950/90 border border-blue-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#14B8A6]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#2563EB] hover:bg-blue-600 text-white"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
