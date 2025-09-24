import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { FaPaperPlane, FaImage, FaMoon } from 'react-icons/fa';
import Picker from 'emoji-picker-react';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef();
  const bottomRef = useRef();

  useEffect(() => {
    // Fetch messages
    supabase.from('messages').select('*').order('created_at', { ascending: true }).then(({ data }) => setMessages(data));

    // Subscribe
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => setMessages(prev => [...prev, payload.new]))
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, []);

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

  const sendMessage = async () => {
    if (!content) return;
    await supabase.from('messages').insert([{ content }]);
    setContent('');
  };

  const sendFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { data } = await supabase.storage.from('chat-media').upload(`${Date.now()}-${file.name}`, file);
    const url = supabase.storage.from('chat-media').getPublicUrl(data.path).publicUrl;
    await supabase.from('messages').insert([{ content: '', image_url: url }]);
  };

  const onEmojiClick = (event, emojiObject) => setContent(prev => prev + emojiObject.emoji);

  return (
    <div className={`${darkMode ? 'dark' : ''} flex flex-col h-screen bg-gray-100 dark:bg-gray-900`}>
      <div className="flex justify-between items-center p-4 bg-green-500 dark:bg-green-700 text-white">
        <h1>VartaLaap</h1>
        <button onClick={() => setDarkMode(!darkMode)}><FaMoon /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.user_id ? 'justify-end' : 'justify-start'}`}>
            <div className={`${msg.user_id ? 'bg-green-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-black'} rounded-lg p-2 max-w-xs break-words`}>
              {msg.content && <p>{msg.content}</p>}
              {msg.image_url && <img src={msg.image_url} className="max-w-full rounded" />}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      {showEmoji && <Picker onEmojiClick={onEmojiClick} />}

      <div className="flex items-center p-2 border-t dark:border-gray-700">
        <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>
        <input type="text" value={content} onChange={e => setContent(e.target.value)} className="flex-1 mx-2 p-2 rounded border dark:bg-gray-800 dark:text-white" placeholder="Type a message..." />
        <input type="file" ref={fileInputRef} onChange={sendFile} className="hidden" />
        <button onClick={() => fileInputRef.current.click()}><FaImage /></button>
        <button onClick={sendMessage} className="ml-2 bg-green-500 dark:bg-green-700 p-2 rounded"><FaPaperPlane /></button>
      </div>
    </div>
  );
}
