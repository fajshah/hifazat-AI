import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Phone,
  Trash2,
  Heart,
  Send,
  Check,
} from 'lucide-react';
import { EmergencyContact } from '../types/safety';

interface EmergencyContactsManagerProps {
  contacts: EmergencyContact[];
  onChangeContacts: (contacts: EmergencyContact[]) => void;
  language: 'romanUrdu' | 'english';
}

export const EmergencyContactsManager: React.FC<EmergencyContactsManagerProps> = ({
  contacts,
  onChangeContacts,
  language,
}) => {
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Mother / امی');
  const [phone, setPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const isUrdu = language === 'romanUrdu';

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim()) return;
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name,
      relationship,
      phone,
      isPrimary: contacts.length === 0,
    };
    onChangeContacts([...contacts, newContact]);
    setName('');
    setPhone('');
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    onChangeContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-rose-50">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
            <span>{isUrdu ? 'حفاظتی رشتہ دار اور ایمرجنسی نمبرز (Guardians)' : 'Emergency Guardian Contacts'}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isUrdu
              ? 'اپنے والدین، بھائی، شوہر یا قابل اعتماد دوستوں کے نمبر محفوظ کریں تاکہ ایمرجنسی میں ایک کلک پر الرٹ پہنچ سکے۔'
              : 'Add trusted family members and friends. SOS alerts will reach them instantly with your live location.'}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{isUrdu ? 'نیا نمبر شامل کریں' : 'Add Guardian'}</span>
        </button>
      </div>

      {isAdding && (
        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3">
          <span className="text-xs font-bold text-rose-900 block">
            {isUrdu ? 'نئے رشتہ دار کی تفصیل درج کریں:' : 'Add New Trusted Guardian:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'نام (Name)' : 'Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abu, Bhai, Ammi"
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'رشتہ (Relationship)' : 'Relationship'}
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              >
                <option value="Mother / امی">Mother / امی</option>
                <option value="Father / ابو">Father / ابو</option>
                <option value="Brother / بھائی">Brother / بھائی</option>
                <option value="Husband / شوہر">Husband / شوہر</option>
                <option value="Sister / بہن">Sister / بہن</option>
                <option value="Friend / دوست">Friend / دوست</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                {isUrdu ? 'موبائل نمبر (Phone Number)' : 'Mobile Phone Number'}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleAddContact}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              Save Contact
            </button>
          </div>
        </div>
      )}

      {/* List of Contacts */}
      <div className="space-y-2">
        {contacts.map((c) => (
          <div
            key={c.id}
            className="p-3.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-medium">
                  {c.relationship}
                </span>
              </div>
              <span className="text-xs font-mono text-slate-500 mt-0.5 block">{c.phone}</span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${c.phone}`}
                className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-colors"
                title="Call"
              >
                <Phone className="w-4 h-4" />
              </a>

              <a
                href={`https://wa.me/${c.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Assalam-o-Alaikum, Hifazat Safety Test Message.')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                title="WhatsApp Test"
              >
                <Send className="w-4 h-4" />
              </a>

              <button
                onClick={() => handleDelete(c.id)}
                className="p-2 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {contacts.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            {isUrdu
              ? 'ابھی کوئی گارڈین نمبر شامل نہیں ہے۔ اوپر "نیا نمبر شامل کریں" پر کلک کریں۔'
              : 'No emergency contacts added yet. Click "Add Guardian" above to save your family contacts.'}
          </div>
        )}
      </div>
    </div>
  );
};
