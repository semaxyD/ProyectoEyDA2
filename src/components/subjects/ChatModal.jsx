// ChatModal.tsx
import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';

export default function ChatModal({ subject, isOpen, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!subject || !isOpen) return;

    const messagesRef = collection(db, 'subjects', subject.id, 'chat');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [subject, isOpen]);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    await addDoc(collection(db, 'subjects', subject.id, 'chat'), {
      text: trimmed,
      senderId: user.uid,
      senderName: user.displayName || 'Anónimo',
      createdAt: serverTimestamp(),
    });

    setNewMessage('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <div className="flex flex-col h-[400px] overflow-y-auto space-y-2 border p-4 rounded-md bg-gray-100">
          {messages.length === 0 && (
            <p className="text-center text-gray-500">Aún no hay mensajes.</p>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 rounded-md max-w-[70%] break-words ${
                msg.senderId === user.uid ? 'bg-blue-200 self-end' : 'bg-white self-start'
              }`}
            >
              <p className="text-sm font-semibold">{msg.senderName}</p>
              <p>{msg.text}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-2 pt-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage}>Enviar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
