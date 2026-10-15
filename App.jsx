import React, { useState, useEffect } from 'react';
import { 
  Home, Layers, Users, User, Shield, Lock, Unlock, CheckCircle, 
  Copy, ArrowRight, DollarSign, Send, Phone, MessageSquare, 
  AlertCircle, LogOut, RefreshCw, X, ChevronRight, Wallet, Award, Settings, Plus, Trash2, Check, CreditCard
} from 'lucide-react';

// ==========================================
// PLATFORM DEFAULT CONFIGURATION
// ==========================================
const DEFAULT_CONFIG = {
  name: "sky digital income",
  superAdminPhone: "0944357893", // ዋናው አድሚን ስልክ ቁጥር
  supportTelegram: "@Addispro_adimin",
  channelLink: "https://t.me/addispro1",
  currency: "ETB",
  registrationBonus: 150,
  minDeposit: 500,
  minWithdrawal: 150,
  
  packages: [
    { id: 1, name: "Sky Level 1", price: 500, dailyIncome: 100, totalProfit: 10000, durationDays: 100 },
    { id: 2, name: "Sky Level 2", price: 700, dailyIncome: 150, totalProfit: 15000, durationDays: 100 },
    { id: 3, name: "Sky Level 3", price: 1000, dailyIncome: 220, totalProfit: 22000, durationDays: 100 },
    { id: 4, name: "Sky Level 4", price: 2000, dailyIncome: 460, totalProfit: 46000, durationDays: 100 },
    { id: 5, name: "Sky Level 5", price: 3000, dailyIncome: 700, totalProfit: 70000, durationDays: 100 },
  ],

  // አድሚኑ መጨመርና መቀነስ የሚችላቸው የክፍያ መንገዶች
  paymentAccounts: [
    { id: 1, method: "Telebirr Wallet", accountName: "Mehalnesh", accountNumber: "0932081500" },
    { id: 2, method: "Commercial Bank of Ethiopia", accountName: "Mehalnesh", accountNumber: "1000XXXXXXXXX" }
  ]
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  
  // Deposit States
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [depositStep, setDepositStep] = useState('amount'); 
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [txRef, setTxRef] = useState('');

  // Database States
  const [platformConfig, setPlatformConfig] = useState(DEFAULT_CONFIG);
  const [usersList, setUsersList] = useState([]);
  const [transactions, setTransactions] = useState([]); 
  const [copied, setCopied] = useState(false);

  // Admin Package Form
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('');
  const [newPkgDaily, setNewPkgDaily] = useState('');
  const [newPkgTotal, setNewPkgTotal] = useState('');
  const [newPkgDays, setNewPkgDays] = useState('100');

  // Admin Payment Method Form (አዳዲስ አካውንቶችን መጨመሪያ)
  const [newPayMethod, setNewPayMethod] = useState('Telebirr Wallet');
  const [newAccName, setNewAccName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');

  const [newAdminPhone, setNewAdminPhone] = useState(''); 

  useEffect(() => {
    const savedConfig = localStorage.getItem('sky_platform_config');
    if (savedConfig) {
      const parsedConfig = JSON.parse(savedConfig);
      setPlatformConfig(parsedConfig);
      if (parsedConfig.paymentAccounts && parsedConfig.paymentAccounts.length > 0) {
        setSelectedAccount(parsedConfig.paymentAccounts[0]);
      }
    } else {
      localStorage.setItem('sky_platform_config', JSON.stringify(DEFAULT_CONFIG));
      setSelectedAccount(DEFAULT_CONFIG.paymentAccounts[0]);
    }

    const savedUsers = localStorage.getItem('sky_users');
    if (savedUsers) {
      setUsersList(JSON.parse(savedUsers));
    } else {
      const initialUsers = [
        { phone: '0944357893', balance: 150, deposit: 0, status: 'Active', role: 'super_admin', joined: '2026-06-06' },
      ];
      setUsersList(initialUsers);
      localStorage.setItem('sky_users', JSON.stringify(initialUsers));
    }

    const savedTx = localStorage.getItem('sky_transactions');
    if (savedTx) setTransactions(JSON.parse(savedTx));

    const active = localStorage.getItem('sky_current_user');
    if (active) {
      const parsedUser = JSON.parse(active);
      setCurrentUser(parsedUser);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!phoneInput || phoneInput.length < 9) {
      alert('እባክዎ ትክክለኛ የስልክ ቁጥር ያስገቡ');
      return;
    }

    let existingUser = usersList.find(u => u.phone === phoneInput);
    
    if (existingUser) {
      if (existingUser.status === 'Blocked') {
        alert('ይህ መለያ ታግዷል (Blocked)።');
        return;
      }
      setCurrentUser(existingUser);
      localStorage.setItem('sky_current_user', JSON.stringify(existingUser));
      setIsLoggedIn(true);
    } else {
      const subAdmins = JSON.parse(localStorage.getItem('sky_sub_admins') || '[]');
      let assignedRole = 'user';
      if (phoneInput === platformConfig.superAdminPhone) {
        assignedRole = 'super_admin';
      } else if (subAdmins.includes(phoneInput)) {
        assignedRole = 'finance_admin'; 
      }

      const newUser = {
        phone: phoneInput,
        balance: platformConfig.registrationBonus,
        deposit: 0,
        status: 'Active',
        role: assignedRole,
        joined: new Date().toISOString().split('T')[0]
      };
      
      const updatedUsers = [...usersList, newUser];
      setUsersList(updatedUsers);
      localStorage.setItem('sky_users', JSON.stringify(updatedUsers));
      
      setCurrentUser(newUser);
      localStorage.setItem('sky_current_user', JSON.stringify(newUser));
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('sky_current_user');
  };

  // አዲስ የክፍያ ሂሳብ መጨመር (ለሱፐር አድሚን)
  const handleAddPaymentAccount = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'super_admin') return;
    if (!newAccName || !newAccNumber) {
      alert('እባክዎ የባንክ/ቴሌብር ስም እና ቁጥር ያስገቡ');
      return;
    }

    const newAcc = {
      id: Date.now(),
      method: newPayMethod,
      accountName: newAccName,
      accountNumber: newAccNumber
    };

    const updatedConfig = {
      ...platformConfig,
      paymentAccounts: [...(platformConfig.paymentAccounts || []), newAcc]
    };

    setPlatformConfig(updatedConfig);
    localStorage.setItem('sky_platform_config', JSON.stringify(updatedConfig));
    setNewAccName('');
    setNewAccNumber('');
    alert('አዲስ የክፍያ ሂሳብ በተሳካ ሁኔታ ተጨምሯል!');
  };

  // የክፍያ ሂሳብ ማጥፋት (ለሱፐር አድሚን)
  const handleDeletePaymentAccount = (accId) => {
    if (currentUser.role !== 'super_admin') return;
    const updatedConfig = {
      ...platformConfig,
      paymentAccounts: platformConfig.paymentAccounts.filter(a => a.id !== accId)
    };
    setPlatformConfig(updatedConfig);
    localStorage.setItem('sky_platform_config', JSON.stringify(updatedConfig));
  };

  // ዩዘር ብሎክ/ማድረግ
  const toggleUserStatus = (targetPhone) => {
    if (currentUser.role !== 'super_admin') return;
    const updated = usersList.map(u => {
      if (u.phone === targetPhone) {
        return { ...u, status: u.status === 'Active' ? 'Blocked' : 'Active' };
      }
      return u;
    });
    setUsersList(updated);
    localStorage.setItem('sky_users', JSON.stringify(updated));
  };

  // ንዑስ አድሚን መጨመር
  const handleAddSubAdmin = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'super_admin' || !newAdminPhone) return;

    const subAdmins = JSON.parse(localStorage.getItem('sky_sub_admins') || '[]');
    if (!subAdmins.includes(newAdminPhone)) {
      subAdmins.push(newAdminPhone);
      localStorage.setItem('sky_sub_admins', JSON.stringify(subAdmins));

      const updatedUsers = usersList.map(u => u.phone === newAdminPhone ? { ...u, role: 'finance_admin' } : u);
      setUsersList(updatedUsers);
      localStorage.setItem('sky_users', JSON.stringify(updatedUsers));

      setNewAdminPhone('');
      alert('ንዑስ አድሚን (Finance Admin) ተጨመረ!');
    }
  };

  // ፓኬጅ መጨመር
  const handleAddPackage = (e) => {
    e.preventDefault();
    if (currentUser.role !== 'super_admin') return;
    const newPackageItem = {
      id: Date.now(),
      name: newPkgName,
      price: Number(newPkgPrice),
      dailyIncome: Number(newPkgDaily),
      totalProfit: Number(newPkgTotal),
      durationDays: Number(newPkgDays) || 100
    };
    const updatedConfig = { ...platformConfig, packages: [...platformConfig.packages, newPackageItem] };
    setPlatformConfig(updatedConfig);
    localStorage.setItem('sky_platform_config', JSON.stringify(updatedConfig));
    setNewPkgName(''); setNewPkgPrice(''); setNewPkgDaily(''); setNewPkgTotal('');
    alert('ፓኬጅ ተጨመረ!');
  };

  const handleDeletePackage = (pkgId) => {
    if (currentUser.role !== 'super_admin') return;
    const updatedConfig = { ...platformConfig, packages: platformConfig.packages.filter(p => p.id !== pkgId) };
    setPlatformConfig(updatedConfig);
    localStorage.setItem('sky_platform_config', JSON.stringify(updatedConfig));
  };

  // የዲፖዚት ጥያቄ መላክ
  const submitDepositRequest = () => {
    if (!txRef) { alert('እባክዎ የትራንዛክሽን ኮድ ያስገቡ'); return; }
    
    const newTx = {
      id: Date.now(),
      phone: currentUser.phone,
      type: 'Deposit',
      amount: Number(selectedAmount),
      method: selectedAccount ? selectedAccount.method : 'Telebirr',
      txRef: txRef,
      status: 'Pending'
    };

    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);
    localStorage.setItem('sky_transactions', JSON.stringify(updatedTxList));

    setDepositStep('success');
  };

  // ዴፖዚት ማፅደቅ
  const handleApproveTx = (txId) => {
    const updatedTx = transactions.map(tx => {
      if (tx.id === txId) {
        const targetUser = usersList.find(u => u.phone === tx.phone);
        if (targetUser) {
          targetUser.deposit = (targetUser.deposit || 0) + tx.amount;
        }
        return { ...tx, status: 'Approved' };
      }
      return tx;
    });
    setTransactions(updatedTx);
    localStorage.setItem('sky_transactions', JSON.stringify(updatedTx));
    localStorage.setItem('sky_users', JSON.stringify(usersList));
    alert('ጥያቄው ጸድቋል (Approved)!');
  };

  const handleRejectTx = (txId) => {
    const updatedTx = transactions.map(tx => tx.id === txId ? { ...tx, status: 'Rejected' } : tx);
    setTransactions(updatedTx);
    localStorage.setItem('sky_transactions', JSON.stringify(updatedTx));
    alert('ጥያቄው ተሰርዟል (Rejected)');
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#f0fdf4] flex flex-col justify-center items-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-emerald-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-2xl shadow-md">
              SD
            </div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">{platformConfig.name}</h1>
            <p className="text-sm text-gray-500 mt-1">ስልክ ቁጥርዎን በማስገባት ይግቡ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">የስልክ ቁጥር</label>
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2.5 focus-within:ring-2 focus-within:ring-emerald-500">
                <Phone className="w-5 h-5 text-gray-400 mr-2" />
                <input 
                  type="text" placeholder="09XXXXXXXX" value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full outline-none text-gray-700 bg-transparent" required
                />
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:bg-emerald-700 transition">
              ግባ / Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'super_admin' || currentUser.role === 'finance_admin';

  return (
    <div className="min-h-screen bg-[#f0fdf4] text-gray-800 pb-20 font-sans max-w-md mx-auto relative shadow-2xl">
      
      {/* WELCOME POPUP MODAL */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center relative shadow-2xl">
            <button onClick={() => setShowWelcomeModal(false)} className="absolute top-4 right-4 text-gray-400 bg-gray-100 p-1.5 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 capitalize">{platformConfig.name}</h3>
            <p className="text-xs text-gray-600 mb-4">ደህንነቱ የተጠበቀ የዲጂታል ገቢ እና ኢንቨስትመንት መድረክ።</p>
            <a href={platformConfig.channelLink} target="_blank" rel="noreferrer" className="block w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-sm text-center shadow">
              የቴሌግራም ቻናል ይቀላቀሉ
            </a>
          </div>
        </div>
      )}

      {/* HEADER TOP BAR */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 sticky top-0 z-30 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold tracking-wide capitalize">{platformConfig.name}</h1>
          <p className="text-[10px] text-emerald-200">
            ስልክ: {currentUser.phone} {currentUser.role === 'super_admin' ? '⭐ (ዋና አድሚን)' : currentUser.role === 'finance_admin' ? '🛡️ (ገንዘብ አድሚን)' : ''}
          </p>
        </div>
        <button onClick={handleLogout} className="text-xs bg-red-500/20 text-red-200 border border-red-400/30 px-3 py-1.5 rounded-lg flex items-center gap-1">
          <LogOut className="w-3.5 h-3.5" /> ውጣ
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="p-4">

        {/* ================= HOME TAB ================= */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {isAdmin && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-medium">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>{currentUser.role === 'super_admin' ? 'የዋና አድሚን ፓነል' : 'የገንዘብ አድሚን ፓነል'}</span>
                </div>
                <button onClick={() => setActiveTab('admin')} className="bg-amber-600 text-white text-xs px-3 py-1 rounded-lg font-semibold shadow">
                  ፓነል ክፈት
                </button>
              </div>
            )}

            {/* BALANCE CARDS */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-gray-900 to-emerald-950 text-white p-4 rounded-2xl shadow-md">
                <p className="text-[11px] text-gray-300">ቀሪ ሂሳብ (Deposit)</p>
                <h3 className="text-lg font-bold mt-1 text-emerald-400">ETB {currentUser.deposit || 0}</h3>
              </div>
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-4 rounded-2xl shadow-md">
                <p className="text-[11px] text-emerald-100">አጠቃላይ ገቢ (Balance)</p>
                <h3 className="text-lg font-bold mt-1">ETB {currentUser.balance}</h3>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-2xl shadow-sm border border-emerald-50 text-center">
              <button onClick={() => setActiveTab('deposit')} className="flex flex-col items-center p-2 hover:bg-emerald-50 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-1"><Wallet className="w-5 h-5" /></div>
                <span className="text-[11px] text-gray-700">ገንዘብ አስገባ</span>
              </button>
              <button onClick={() => setActiveTab('withdraw')} className="flex flex-col items-center p-2 hover:bg-emerald-50 rounded-xl">
                <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-1"><Send className="w-5 h-5" /></div>
                <span className="text-[11px] text-gray-700">ገንዘብ አውጣ</span>
              </button>
              <a href={`https://t.me/${platformConfig.supportTelegram.replace('@','')}`} target="_blank" rel="noreferrer" className="flex flex-col items-center p-2 hover:bg-emerald-50 rounded-xl">
                <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-1"><MessageSquare className="w-5 h-5" /></div>
                <span className="text-[11px] text-gray-700">ድጋፍ</span>
              </a>
              <button onClick={() => setActiveTab('me')} className="flex flex-col items-center p-2 hover:bg-emerald-50 rounded-xl">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-1"><User className="w-5 h-5" /></div>
                <span className="text-[11px] text-gray-700">መለያ</span>
              </button>
            </div>

            {/* PACKAGES */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-800">የኢንቨስትመንት ፓኬጆች</h3>
              {platformConfig.packages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-50 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-gray-800 text-sm flex items-center gap-1.5"><Award className="w-4 h-4 text-emerald-600" /> {pkg.name}</h4>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">{pkg.durationDays} ቀናት</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-emerald-50/40 p-2.5 rounded-xl text-center text-xs">
                    <div><p className="text-[10px] text-gray-500">ዋጋ</p><strong>ETB {pkg.price}</strong></div>
                    <div><p className="text-[10px] text-gray-500">ዕለታዊ</p><strong className="text-emerald-600">ETB {pkg.dailyIncome}</strong></div>
                    <div><p className="text-[10px] text-gray-500">ትርፍ</p><strong className="text-teal-600">ETB {pkg.totalProfit}</strong></div>
                  </div>
                  <button onClick={() => { setSelectedPackage(pkg); setSelectedAmount(pkg.price); setActiveTab('deposit'); }} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2.5 rounded-xl font-semibold text-xs shadow flex items-center justify-center gap-1">
                    አሁን ኢንቨስት አድርግ <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= DEPOSIT TAB ================= */}
        {activeTab === 'deposit' && (
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-50 space-y-4">
            <h2 className="text-base font-bold text-gray-800 border-b pb-2">ገንዘብ ማስገቢያ (Deposit)</h2>

            {depositStep === 'amount' && (
              <div className="space-y-3">
                <p className="text-xs text-gray-600">የሚፈልጉትን መጠን ይምረጡ:</p>
                <div className="grid grid-cols-3 gap-2">
                  {[500, 700, 1000, 2000, 3000].map((amt) => (
                    <button key={amt} onClick={() => setSelectedAmount(amt)} className={`py-2.5 rounded-xl font-semibold text-xs border ${selectedAmount === amt ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-700'}`}>
                      ETB {amt}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="block text-xs font-semibold text-gray-600">የክፍያ ሂሳብ/ባንክ ይምረጡ፡</label>
                  <div className="space-y-2">
                    {(platformConfig.paymentAccounts || []).map((acc) => (
                      <div 
                        key={acc.id} 
                        onClick={() => setSelectedAccount(acc)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center ${selectedAccount && selectedAccount.id === acc.id ? 'border-emerald-600 bg-emerald-50/50 font-bold' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div>
                          <p className="text-gray-800">{acc.method}</p>
                          <p className="text-[10px] text-gray-500">{acc.accountName} - {acc.accountNumber}</p>
                        </div>
                        {selectedAccount && selectedAccount.id === acc.id && <Check className="w-4 h-4 text-emerald-600" />}
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={() => setDepositStep('transfer')} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold text-xs shadow mt-4">
                  ቀጥል (Continue)
                </button>
              </div>
            )}

            {depositStep === 'transfer' && selectedAccount && (
              <div className="space-y-4 text-xs">
                <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 space-y-2">
                  <div className="flex justify-between"><span>የክፍያ አይነት:</span><strong className="text-emerald-800">{selectedAccount.method}</strong></div>
                  <div className="flex justify-between"><span>የሚከፍሉት መጠን:</span><strong className="text-emerald-700">ETB {selectedAmount}</strong></div>
                  <div className="flex justify-between"><span>የአካውንት ስም:</span><strong>{selectedAccount.accountName}</strong></div>
                  <div className="flex justify-between items-center"><span>የአካውንት ቁጥር:</span>
                    <div className="flex items-center gap-1">
                      <strong className="text-emerald-800 font-mono text-sm">{selectedAccount.accountNumber}</strong>
                      <button onClick={() => handleCopy(selectedAccount.accountNumber)} className="bg-white p-1 rounded border shadow-sm"><Copy className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
                {copied && <p className="text-[10px] text-emerald-600 text-center font-bold">ቁጥሩ ኮፒ ተደርጓል!</p>}
                <textarea rows="3" placeholder="የክፍያ ማረጋገጫ (SMS / v2 / FT ኮድ) እዚህ ይለጥፉ..." value={txRef} onChange={(e) => setTxRef(e.target.value)} className="w-full border p-2.5 rounded-xl bg-gray-50 outline-none"></textarea>
                <div className="flex gap-2">
                  <button onClick={() => setDepositStep('amount')} className="w-1/3 bg-gray-200 py-2.5 rounded-xl font-semibold">ተመለስ</button>
                  <button onClick={submitDepositRequest} className="w-2/3 bg-emerald-600 text-white py-2.5 rounded-xl font-semibold shadow">አረጋግጥ (Submit)</button>
                </div>
              </div>
            )}

            {depositStep === 'success' && (
              <div className="text-center py-6 space-y-3">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto" />
                <h3 className="font-bold text-gray-800 text-base">የክፍያ ጥያቄዎ ለአድሚን ተልኳል!</h3>
                <p className="text-xs text-gray-500">አድሚኑ ሲያረጋግጥ አካውንትዎ ላይ ይገባል።</p>
                <button onClick={() => { setDepositStep('amount'); setActiveTab('home'); }} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-xs font-semibold">ወደ ዋናው ገፅ</button>
              </div>
            )}
          </div>
        )}

        {/* ================= ASSETS TAB ================= */}
        {activeTab === 'assets' && (
          <div className="bg-white p-4 rounded-2xl shadow-sm text-center py-10 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">📊</div>
            <h3 className="font-bold text-gray-800">ምንም ንቁ ኢንቨስትመንት የለም</h3>
            <button onClick={() => setActiveTab('home')} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-semibold">ፓኬጆችን ፈልግ</button>
          </div>
        )}

        {/* ================= TEAM TAB ================= */}
        {activeTab === 'team' && (
          <div className="space-y-4 text-xs">
            <div className="bg-white p-4 rounded-2xl shadow-sm border space-y-3">
              <h3 className="font-bold text-gray-800">የግብዣ ሊንክ</h3>
              <div className="flex items-center bg-gray-50 border p-2 rounded-xl">
                <input type="text" readOnly value={`https://${platformConfig.name}.net/reg?ref=${currentUser.phone}`} className="bg-transparent w-full outline-none" />
                <button onClick={() => handleCopy(`https://${platformConfig.name}.net/reg?ref=${currentUser.phone}`)} className="bg-emerald-600 text-white px-3 py-1 rounded-lg">ኮፒ</button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMIN CONTROL PANEL TAB ================= */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-4 text-xs">
            
            {/* DEPOSIT APPROVAL SECTION */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-200 space-y-3">
              <h2 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5 border-b pb-2">
                <Check className="w-4 h-4" /> የገንዘብ ጥያቄዎች ማጽደቂያ (Deposit Approvals)
              </h2>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {transactions.length === 0 ? (
                  <p className="text-gray-400 text-center py-3">ምንም የጥያቄ መዝገብ የለም</p>
                ) : (
                  transactions.map((tx) => (
                    <div key={tx.id} className="bg-gray-50 p-2.5 rounded-xl border flex justify-between items-center">
                      <div>
                        <p className="font-bold">{tx.phone} - <span className="text-emerald-600">ETB {tx.amount}</span></p>
                        <p className="text-[10px] text-gray-500">መንገድ: {tx.method} | ኮድ: {tx.txRef}</p>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${tx.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : tx.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {tx.status}
                        </span>
                      </div>
                      {tx.status === 'Pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => handleApproveTx(tx.id)} className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg font-bold">አጽድቅ</button>
                          <button onClick={() => handleRejectTx(tx.id)} className="bg-red-500 text-white px-2 py-1 rounded-lg">አልቀበልም</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SUPER ADMIN ONLY SECTIONS */}
            {currentUser.role === 'super_admin' && (
              <>
                {/* PAYMENT ACCOUNTS MANAGEMENT (አዳዲስ ባንኮችን/ቴሌብር መጨመሪያ) */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-teal-200 space-y-3">
                  <h2 className="text-sm font-bold text-teal-800 flex items-center gap-1.5 border-b pb-2">
                    <CreditCard className="w-4 h-4" /> የክፍያ ሂሳቦች አስተዳደር (Payment Accounts)
                  </h2>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {(platformConfig.paymentAccounts || []).map((acc) => (
                      <div key={acc.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-xl border">
                        <div>
                          <p className="font-bold text-gray-800">{acc.method}</p>
                          <p className="text-[10px] text-gray-500">{acc.accountName} - {acc.accountNumber}</p>
                        </div>
                        <button onClick={() => handleDeletePaymentAccount(acc.id)} className="text-red-600 font-bold p-1">አጥፋ</button>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleAddPaymentAccount} className="space-y-2 bg-teal-50/50 p-3 rounded-xl border border-teal-100">
                    <p className="font-bold text-teal-900 text-[11px]">አዲስ ባንክ/ቴሌብር ጨምር</p>
                    <select value={newPayMethod} onChange={(e) => setNewPayMethod(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none">
                      <option value="Telebirr Wallet">Telebirr Wallet</option>
                      <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia (CBE)</option>
                      <option value="Bank of Abyssinia">Bank of Abyssinia</option>
                      <option value="Awash Bank">Awash Bank</option>
                    </select>
                    <input type="text" placeholder="የአካውንት ስም (e.g. Mehalnesh)" value={newAccName} onChange={(e) => setNewAccName(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none" required />
                    <input type="text" placeholder="የአካውንት ቁጥር (e.g. 0932081500)" value={newAccNumber} onChange={(e) => setNewAccNumber(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none" required />
                    <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg font-bold">ሂሳብ ጨምር</button>
                  </form>
                </div>

                {/* SUB-ADMIN MANAGEMENT */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-200 space-y-3">
                  <h2 className="text-sm font-bold text-amber-800 flex items-center gap-1.5 border-b pb-2">
                    <Shield className="w-4 h-4" /> ንዑስ (Finance) አድሚን መመዝገቢያ
                  </h2>
                  <form onSubmit={handleAddSubAdmin} className="flex gap-2">
                    <input 
                      type="text" placeholder="የአድሚን ስልክ (09XXXXXXXX)" value={newAdminPhone} onChange={(e) => setNewAdminPhone(e.target.value)}
                      className="border p-2 rounded-xl w-full outline-none bg-gray-50" required 
                    />
                    <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded-xl font-bold whitespace-nowrap">ጨምር</button>
                  </form>
                </div>

                {/* USERS MANAGEMENT */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-amber-200 space-y-3">
                  <h2 className="text-sm font-bold text-amber-800 border-b pb-2">ተጠቃሚዎች መቆጣጠሪያ</h2>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {usersList.map((usr, index) => (
                      <div key={index} className="bg-gray-50 p-2.5 rounded-xl border flex justify-between items-center">
                        <div>
                          <p className="font-bold">{usr.phone} <span className="text-[10px] text-gray-500">({usr.role})</span></p>
                          <p className="text-[10px] text-gray-500">ቀሪ: ETB {usr.balance}</p>
                        </div>
                        {usr.phone !== platformConfig.superAdminPhone && (
                          <button onClick={() => toggleUserStatus(usr.phone)} className={`px-2.5 py-1 rounded-lg font-bold ${usr.status === 'Active' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`}>
                            {usr.status === 'Active' ? 'ብሎክ' : 'ክፈት'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* PACKAGES MANAGEMENT */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-200 space-y-3">
                  <h2 className="text-sm font-bold text-emerald-800 border-b pb-2">የፓኬጆች አስተዳደር</h2>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {platformConfig.packages.map((pkg) => (
                      <div key={pkg.id} className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border">
                        <span>{pkg.name} - ETB {pkg.price}</span>
                        <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-600 font-bold p-1">አጥፋ</button>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleAddPackage} className="space-y-2 bg-emerald-50/50 p-3 rounded-xl border">
                    <input type="text" placeholder="የፓኬጅ ስም" value={newPkgName} onChange={(e) => setNewPkgName(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none" required />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" placeholder="ዋጋ (ETB)" value={newPkgPrice} onChange={(e) => setNewPkgPrice(e.target.value)} className="p-2 border rounded-lg bg-white outline-none" required />
                      <input type="number" placeholder="ዕለታዊ ገቢ" value={newPkgDaily} onChange={(e) => setNewPkgDaily(e.target.value)} className="p-2 border rounded-lg bg-white outline-none" required />
                    </div>
                    <input type="number" placeholder="ጠቅላላ ትርፍ" value={newPkgTotal} onChange={(e) => setNewPkgTotal(e.target.value)} className="w-full p-2 border rounded-lg bg-white outline-none" required />
                    <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold">ፓኬጅ ጨምር</button>
                  </form>
                </div>
              </>
            )}

          </div>
        )}

        {/* ================= ME TAB ================= */}
        {activeTab === 'me' && (
          <div className="space-y-4 text-xs">
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 rounded-2xl flex items-center gap-3 shadow-md">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold text-lg">👤</div>
              <div>
                <h3 className="font-bold text-sm">{currentUser.phone}</h3>
                <p className="text-emerald-200">ሚና: {currentUser.role}</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border divide-y">
              {isAdmin && (
                <button onClick={() => setActiveTab('admin')} className="w-full p-3.5 text-left flex justify-between items-center text-amber-700 font-bold">
                  <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> የአድሚን ፓነል መቆጣጠሪያ</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button onClick={handleLogout} className="w-full p-3.5 text-left flex justify-between items-center text-red-600 font-semibold">
                <span className="flex items-center gap-2"><LogOut className="w-4 h-4" /> ከሲስተሙ ውጣ</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-emerald-100 flex justify-around py-2.5 z-40 shadow-lg">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center ${activeTab === 'home' ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
          <Home className="w-5 h-5 mb-0.5" /><span className="text-[10px]">ዋና ገፅ</span>
        </button>
        <button onClick={() => setActiveTab('assets')} className={`flex flex-col items-center ${activeTab === 'assets' ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
          <Layers className="w-5 h-5 mb-0.5" /><span className="text-[10px]">ንብረቶች</span>
        </button>
        <button onClick={() => setActiveTab('team')} className={`flex flex-col items-center ${activeTab === 'team' ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
          <Users className="w-5 h-5 mb-0.5" /><span className="text-[10px]">ቡድን</span>
        </button>
        <button onClick={() => setActiveTab('me')} className={`flex flex-col items-center ${activeTab === 'me' ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
          <User className="w-5 h-5 mb-0.5" /><span className="text-[10px]">እኔ</span>
        </button>
      </div>

    </div>
  );
}
