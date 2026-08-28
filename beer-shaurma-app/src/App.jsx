import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rviflimvvttrgmqteskf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2aWZsaW12dnR0cmdtcXRlc2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwMjg2NzUsImV4cCI6MjA5MTYwNDY3NX0.hamJE488ku3WN6R0YzQvUhjD0tgk_LnYl9PhKUP0cLs';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

const GAME_ITEMS = ['🍺', '🌯', '🥨', '🧀', '🍟', '🥓', '🍕', '🌭', '🍗', '🍔'];

const BEER_FACTS = [
    '🍺 Первый рецепт пенного напитка был найден на глиняных табличках возрастом более 5000 лет в Древнем Межречье.',
    '🥨 Соленая соломка и крендели стали традиционной закуской к пиву благодаря баварским пекарям еще в XIX веке.',
    '🧀 Жирные сыры и снеки идеально подходят к насыщенным сортам, так как жиры смягчают плотную горечь.',
    '🌭 Культура быстрых мясных закусок и стритфуда зарождалась параллельно с развитием пивных домов Европы.',
    '🍟 Картофель фри родом из Бельгии, где его традиционно подавали к местным плотным сортам пива.'
];

const DISPLAY_PRIZES = [
    { id: 'jackpot', label: '2 000 ₽', subText: 'СУПЕР ДЖЕКПOТ!', type: 'jackpot', value: 2000, bg: 'from-amber-400 via-yellow-500 to-amber-600', textDark: true, badge: '👑 ДЖEКПOТ' },
    { id: 1, label: '50 ₽', subText: 'Бонусы на карту', type: 'bonus', value: 50, bg: 'from-amber-600 to-amber-800', badge: '' },
    { id: 2, label: 'Ничего', subText: 'Повезет в следующий раз', type: 'zero', value: 0, bg: 'from-neutral-800 to-neutral-900', badge: '' },
    { id: 3, label: 'Скидка 50%', subText: 'На мини-шаурму', type: 'promo', value: 'Скидка 50% на мини-шаурму', bg: 'from-red-600 to-red-800', badge: '🔥 ХИТ' },
    { id: 4, label: 'Увы! Мимо', subText: 'Попробуй еще раз', type: 'zero', value: 0, bg: 'from-neutral-800 to-neutral-900', badge: '' },
    { id: 5, label: '100 ₽', subText: 'Бонусы на карту', type: 'bonus', value: 100, bg: 'from-emerald-600 to-teal-800', badge: '🎁 ТОП' },
    { id: 6, label: 'Попробуй снова', subText: 'Не повезло', type: 'zero', value: 0, bg: 'from-neutral-800 to-neutral-900', badge: '' },
    { id: 7, label: '+1 Спин', subText: 'Бесплатный прокрут', type: 'free_spin', value: 1, bg: 'from-sky-500 to-blue-700', badge: '⚡ БОНУС' },
    { id: 8, label: 'Пусто', subText: 'Ничего не выпало', type: 'zero', value: 0, bg: 'from-neutral-800 to-neutral-900', badge: '' },
];
const WINNABLE_PRIZES = DISPLAY_PRIZES.filter(p => p.type !== 'jackpot');

export default function App() {
    const [phone, setPhone] = useState('');
    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [inputPhone, setInputPhone] = useState('');
    const [activeTab, setActiveTab] = useState('wheel');

    const [promotions, setPromotions] = useState([]);

    const [legalModal, setLegalModal] = useState(null);
    const [dailyBonusModal, setDailyBonusModal] = useState(null);
    const [gameOverModal, setGameOverModal] = useState(false);

    const [spinning, setSpinning] = useState(false);
    const [winModal, setWinModal] = useState(null);
    const [spinHistory, setSpinHistory] = useState([]);
    const [freeSpinsCount, setFreeSpinsCount] = useState(0);
    const [reelItems, setReelItems] = useState([]);
    const [reelTranslateX, setReelTranslateX] = useState(0);
    const reelContainerRef = useRef(null);
    const spinCountRef = useRef(0);

    const [selectedType, setSelectedType] = useState('Традиционная');
    const [selectedSize, setSelectedSize] = useState('Большая');
    const [selectedSauce, setSelectedSauce] = useState('Тар-Тар');
    const [orderNote, setOrderNote] = useState('');
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [isOrdering, setIsOrdering] = useState(false);

    const [boardTiles, setBoardTiles] = useState([]);
    const [trayTiles, setTrayTiles] = useState([]);
    const [gameScore, setGameScore] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [gameMode, setGameMode] = useState('hard');
    const [gameLevel, setGameLevel] = useState(1);
    const [currentTarget, setCurrentTarget] = useState(7000);
    const [currentFact, setCurrentFact] = useState('');

    useEffect(() => {
        const savedPhone = localStorage.getItem('customer_phone');
        if (savedPhone) {
            setPhone(savedPhone);
            fetchCustomerData(savedPhone);
        }
        initReel();
        initTileGame('hard');
        fetchPromotions();
        randomizeFact();
        registerServiceWorker();
    }, []);

    useEffect(() => {
        if (!phone) return;
        const interval = setInterval(() => {
            fetchCustomerData(phone, true);
        }, 5000);
        return () => clearInterval(interval);
    }, [phone]);

    const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
            } catch (err) {
                console.error('Ошибка регистрации Service Worker:', err);
            }
        }
    };

    const subscribeUserToPush = async () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            alert('Ваш браузер не поддерживает пуш-уведомления.');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Вставьте ваш публичный VAPID-ключ (генерируется отдельно)
            const publicVapidKey = 'BKeRoNmqd5IIkX1aWyORUiNtPeMTvT3Ey9uvXuVX7XR1uBto4gXN68h0dSRsFusj6z7vz6yFrJ7kZ7PVtALUstU';
            const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            const { error } = await supabaseClient
                .from('push_subscriptions')
                .upsert({
                    user_phone: phone,
                    subscription: subscription
                }, { onConflict: 'user_phone' });

            if (error) throw error;
            alert('Уведомления успешно включены!');
        } catch (error) {
            console.error('Ошибка при подписке на пуши:', error);
            alert('Не удалось включить уведомления. Проверьте разрешения браузера.');
        }
    };

    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(0);
        }
        return outputArray;
    };

    const randomizeFact = () => {
        const fact = BEER_FACTS[Math.floor(Math.random() * BEER_FACTS.length)];
        setCurrentFact(fact);
    };

    const fetchPromotions = async () => {
        try {
            const { data, error } = await supabaseClient
                .from('promotions')
                .select('*')
                .order('created_at', { ascending: false });
            if (!error && data) setPromotions(data);
        } catch (e) {
            console.error(e);
        }
    };

    const initReel = () => {
        let repeated = [];
        for (let i = 0; i < 50; i++) repeated = [...repeated, ...DISPLAY_PRIZES];
        setReelItems(repeated);
    };

    const fetchCustomerData = async (userPhone, isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const { data } = await supabaseClient
                .from('customers')
                .select('*')
                .eq('phone', userPhone)
                .single();

            if (data) {
                setCustomer(data);
                checkDailyBonus(data);
            } else if (!isBackground) {
                alert('Гость с таким номером не найден!');
                localStorage.removeItem('customer_phone');
                setPhone('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    const checkDailyBonus = async (cust) => {
        const today = new Date().toISOString().slice(0, 10);
        const lastBonusDate = localStorage.getItem(`daily_bonus_date_${cust.phone}`);
        const streakCount = parseInt(localStorage.getItem(`daily_bonus_streak_${cust.phone}`) || '0', 10);

        if (lastBonusDate !== today) {
            const nextStreak = streakCount + 1;
            const rewardAmount = nextStreak % 2 === 1 ? 5 : 10;
            const newBalance = (cust.balance || 0) + rewardAmount;
            
            await supabaseClient
                .from('customers')
                .update({ balance: newBalance })
                .eq('phone', cust.phone);

            localStorage.setItem(`daily_bonus_date_${cust.phone}`, today);
            localStorage.setItem(`daily_bonus_streak_${cust.phone}`, nextStreak.toString());
            setCustomer(prev => ({ ...prev, balance: newBalance }));
            setDailyBonusModal({ day: nextStreak, reward: rewardAmount });
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!inputPhone) return;
        const cleanPhone = inputPhone.trim();
        localStorage.setItem('customer_phone', cleanPhone);
        setPhone(cleanPhone);
        fetchCustomerData(cleanPhone);
    };

    const handleLogout = () => {
        localStorage.removeItem('customer_phone');
        setPhone('');
        setCustomer(null);
        setInputPhone('');
    };

    const addBonusToDB = async (amount) => {
        if (!customer) return;
        const newBal = (customer.balance || 0) + amount;
        const { data } = await supabaseClient
            .from('customers')
            .update({ balance: newBal })
            .eq('phone', customer.phone)
            .select()
            .single();
        if (data) setCustomer(data);
    };

    const spinWheel = async () => {
        if (spinning) return;
        const today = new Date().toISOString().slice(0, 10);
        const spinKey = `spin_data_v6_${customer.phone}_${today}`;
        const storedSpins = JSON.parse(localStorage.getItem(spinKey) || '{"paidCount": 0}');

        let isFreeSpinUsed = false;
        if (freeSpinsCount > 0) {
            isFreeSpinUsed = true;
        } else {
            if (storedSpins.paidCount >= 3) {
                alert('Вы исчерпали лимит в 3 попытки на сегодня! Приходите завтра.');
                return;
            }
            if ((customer.balance || 0) < 25) {
                alert('Недостаточно бонусов! Стоимость игры — 25 бонусов.');
                return;
            }
            if (!confirm('Списать 25 бонусов за прокрут рулетки?')) return;
        }

        if (isFreeSpinUsed) {
            setFreeSpinsCount(prev => prev - 1);
        } else {
            await addBonusToDB(-25);
            storedSpins.paidCount += 1;
            localStorage.setItem(spinKey, JSON.stringify(storedSpins));
        }

        setSpinning(true);
        const randomWinPrize = WINNABLE_PRIZES[Math.floor(Math.random() * WINNABLE_PRIZES.length)];
        const prizeIndex = DISPLAY_PRIZES.findIndex(p => p.id === randomWinPrize.id);

        spinCountRef.current += 3;
        const totalCardsInBlock = DISPLAY_PRIZES.length;
        const targetCardIndex = (spinCountRef.current * totalCardsInBlock) + prizeIndex;

        const cardStep = 156;
        const cardCenterOffset = 70;
        const containerWidth = reelContainerRef.current ? reelContainerRef.current.offsetWidth : 350;
        const targetOffset = (targetCardIndex * cardStep + cardCenterOffset) - (containerWidth / 2);

        setReelTranslateX(targetOffset);

        setTimeout(async () => {
            setSpinning(false);
            const isWin = randomWinPrize.type !== 'zero';
            setSpinHistory(prev => [{
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                result: randomWinPrize.label,
                isWin
            }, ...prev]);

            if (randomWinPrize.type === 'bonus') {
                await addBonusToDB(randomWinPrize.value);
                setWinModal({ title: '🎉 ВЫИГРЫШ!', desc: `Вы выиграли ${randomWinPrize.value} бонусов!` });
            } else if (randomWinPrize.type === 'promo') {
                setWinModal({ title: '🌯 СУПЕР ПРИЗ!', desc: 'Вы выиграли скидку 50% на Шаурму Мини!' });
            } else if (randomWinPrize.type === 'free_spin') {
                setFreeSpinsCount(prev => prev + 1);
                setWinModal({ title: '🎁 БОНУС!', desc: 'Вы выиграли +1 бесплатный прокрут!' });
            } else {
                setWinModal({ title: '😔 УПС...', desc: 'В этот раз ничего не выпало. Попробуйте еще!' });
            }
        }, 3800);
    };

    const initTileGame = (mode = gameMode) => {
        const positions = [];
        if (mode === 'hard') {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 4; c++) positions.push({ layer: 0, x: c * 56 + 14, y: r * 58 + 12 });
            }
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) positions.push({ layer: 1, x: c * 56 + 42, y: r * 58 + 26 });
            }
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 3; c++) positions.push({ layer: 2, x: c * 56 + 42, y: r * 58 + 45 });
            }
        } else {
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 4; c++) positions.push({ layer: 0, x: c * 56 + 16, y: r * 58 + 20 });
            }
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 2; c++) positions.push({ layer: 1, x: c * 56 + 44, y: r * 58 + 30 });
            }
            for (let c = 0; c < 3; c++) {
                positions.push({ layer: 2, x: c * 56 + 44, y: 1 * 58 + 20 });
            }
        }

        let iconPool = [];
        if (mode === 'hard') {
            const selectedIcons = GAME_ITEMS.slice(0, 9);
            selectedIcons.forEach(icon => iconPool.push(icon, icon, icon));
        } else {
            const easyIcons = GAME_ITEMS.slice(0, 5);
            easyIcons.forEach(icon => iconPool.push(icon, icon, icon));
        }
        iconPool.sort(() => Math.random() - 0.5);

        const generatedTiles = positions.map((pos, index) => ({
            id: index + 1,
            icon: iconPool[index],
            layer: pos.layer,
            x: pos.x,
            y: pos.y
        }));

        setBoardTiles(generatedTiles);
        setTrayTiles([]);
        setComboCount(0);
        randomizeFact();
    };

    const handleSwitchMode = (newMode) => {
        setGameMode(newMode);
        setGameLevel(1);
        const target = newMode === 'hard' ? 7000 : 2000;
        setCurrentTarget(target);
        setGameScore(0);
        initTileGame(newMode);
    };

    const isTileBlocked = (tile, tilesList) => {
        return tilesList.some(other => 
            other.layer > tile.layer &&
            Math.abs(other.x - tile.x) < 42 &&
            Math.abs(other.y - tile.y) < 44
        );
    };

    const handleReturnTile = async () => {
        if (trayTiles.length === 0) {
            alert('Лоток пуст, нечего возвращать!');
            return;
        }
        if ((customer.balance || 0) < 15) {
            alert('Недостаточно бонусов! Требуется 15 бонусов.');
            return;
        }
        if (!confirm('Списать 15 бонусов, чтобы вернуть последнюю фигуру на поле?')) return;

        await addBonusToDB(-15);
        const lastTile = trayTiles[trayTiles.length - 1];
        setTrayTiles(prev => prev.slice(0, -1));
        setBoardTiles(prev => [...prev, lastTile]);
    };

    const handleShuffleBoard = async () => {
        if (boardTiles.length === 0) return;
        if ((customer.balance || 0) < 15) {
            alert('Недостаточно бонусов! Требуется 15 бонусов.');
            return;
        }
        if (!confirm('Списать 15 бонусов для перемешивания фигур на поле?')) return;

        await addBonusToDB(-15);
        const icons = boardTiles.map(t => t.icon);
        icons.sort(() => Math.random() - 0.5);
        const shuffledBoard = boardTiles.map((t, idx) => ({ ...t, icon: icons[idx] }));
        setBoardTiles(shuffledBoard);
    };

    const handleSelectTile = (tile) => {
        if (isTileBlocked(tile, boardTiles)) return;
        if (trayTiles.length >= 4) return;

        const updatedBoard = boardTiles.filter(t => t.id !== tile.id);
        const updatedTray = [...trayTiles, tile];

        setBoardTiles(updatedBoard);

        const countMap = {};
        updatedTray.forEach(t => {
            countMap[t.icon] = (countMap[t.icon] || 0) + 1;
        });

        let matchedIcon = null;
        for (const icon in countMap) {
            if (countMap[icon] >= 3) {
                matchedIcon = icon;
                break;
            }
        }

        if (matchedIcon) {
            setTimeout(() => {
                let removeCount = 0;
                const filteredTray = updatedTray.filter(t => {
                    if (t.icon === matchedIcon && removeCount < 3) {
                        removeCount++;
                        return false;
                    }
                    return true;
                });
                setTrayTiles(filteredTray);
                
                const newCombo = comboCount + 1;
                setComboCount(newCombo);

                setGameScore(prev => {
                    const addedScore = 100 * newCombo;
                    const newScore = prev + addedScore;
                    const baseTarget = gameMode === 'hard' ? 7000 : 2000;

                    if (newScore >= currentTarget) {
                        if (gameMode === 'hard') {
                            addBonusToDB(100);
                            alert(`🎉 УРОВЕНЬ ${gameLevel} ПРОЙДЕН! Начислено +100 бонусов на карту лояльности! Переходим на следующий уровень.`);
                        } else {
                            alert(`🎉 УРОВЕНЬ ${gameLevel} ПРОЙДЕН! Переходим на следующий уровень. Очки сохраняются.`);
                        }
                        setGameLevel(l => l + 1);
                        setCurrentTarget(t => t + baseTarget);
                    }
                    return newScore;
                });

                if (updatedBoard.length === 0 && filteredTray.length === 0) {
                    setTimeout(() => initTileGame(gameMode), 300);
                }
            }, 180);
        } else {
            setTrayTiles(updatedTray);
            if (updatedTray.length >= 4) {
                setTimeout(() => {
                    setGameScore(0);
                    setGameLevel(1);
                    setCurrentTarget(gameMode === 'hard' ? 7000 : 2000);
                    setGameOverModal(true);
                    initTileGame(gameMode);
                }, 250);
            }
        }
    };

    const handleSendOrder = async (e) => {
        e.preventDefault();
        setIsOrdering(true);
        try {
            const { error } = await supabaseClient
                .from('orders')
                .insert([{
                    customer_phone: customer.phone,
                    item_name: selectedType,
                    size: selectedSize,
                    sauce: selectedSauce,
                    note: orderNote,
                    status: 'new'
                }]);

            if (!error) {
                setOrderSuccess(true);
                setOrderNote('');
                setTimeout(() => setOrderSuccess(false), 4000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsOrdering(false);
        }
    };

    if (!phone || !customer) {
        return (
            <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4 font-sans">
                <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-3xl p-6 text-center space-y-6 shadow-2xl">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">ПИВ<span className="text-amber-500">КУЛЬТУРА</span></h1>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Карта лояльности</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="text-left space-y-1">
                            <label className="text-xs text-neutral-400 font-medium">Введите ваш номер телефона:</label>
                            <input 
                                type="tel" 
                                placeholder="+7 (999) 000-00-00"
                                value={inputPhone}
                                onChange={(e) => setInputPhone(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center text-xl font-bold text-amber-400 focus:outline-none focus:border-amber-500 transition-all"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-amber-400 transition active:scale-95 shadow-lg shadow-amber-500/10"
                        >
                            {loading ? 'Загрузка...' : 'Открыть карту'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 font-sans flex flex-col justify-between max-w-md mx-auto pb-24">
            <div className="flex justify-between items-center py-2 border-b border-neutral-800 pb-3">
                <div>
                    <h2 className="text-xl font-black tracking-tight">ПИВ<span className="text-amber-500">КУЛЬТУРА</span></h2>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase">{customer.name}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                        {customer.balance || 0} 🪙
                    </span>
                    <button onClick={handleLogout} className="text-[10px] text-neutral-500 underline font-bold">Выйти</button>
                </div>
            </div>

            {activeTab === 'card' && (
                <div className="space-y-4 my-auto pt-4">
                    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-neutral-950 shadow-2xl shadow-amber-500/10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="bg-neutral-950/20 text-neutral-950 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase">
                                    {customer.level || 'Новичок'}
                                </span>
                                <p className="text-xs font-bold mt-2 opacity-80">Баланс бонусов</p>
                            </div>
                            <span className="text-xs font-bold opacity-80">Визитов: {customer.visits || 0}</span>
                        </div>

                        <div>
                            <div className="text-5xl font-black tracking-tight">
                                {customer.balance || 0} <span className="text-2xl">₽</span>
                            </div>
                            <p className="text-[10px] font-bold opacity-75 mt-1">1 бонус = 1 рубль</p>
                        </div>

                        <div className="bg-neutral-950/10 p-3.5 rounded-2xl text-center backdrop-blur-sm border border-black/5">
                            <p className="text-[9px] font-bold uppercase opacity-75">Назови номер бармену:</p>
                            <p className="text-xl font-black tracking-wider mt-0.5">{customer.phone}</p>
                        </div>
                    </div>

                    <button 
                        onClick={subscribeUserToPush} 
                        className="w-full py-3 bg-neutral-900 border border-neutral-800 text-amber-400 font-bold text-xs uppercase tracking-wider rounded-2xl hover:bg-neutral-800 transition"
                    >
                        🔔 Включить пуш-уведомления
                    </button>

                    <div className="flex justify-center space-x-4 pt-2">
                        <button onClick={() => setLegalModal('terms')} className="text-[10px] text-neutral-500 underline font-medium">
                            Соглашение
                        </button>
                        <button onClick={() => setLegalModal('privacy')} className="text-[10px] text-neutral-500 underline font-medium">
                            Конфиденциальность
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'wheel' && (
                <div className="my-auto pt-2 space-y-4">
                    <div className="bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[420px]">
                        <div className="flex items-center justify-between z-10">
                            <div className="bg-white/90 text-neutral-950 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md">
                                <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[11px] font-black text-white">🪙</span>
                                <span className="font-extrabold text-xs">{customer.balance || 0}</span>
                            </div>

                            <div className="flex space-x-2">
                                {freeSpinsCount > 0 && (
                                    <span className="bg-amber-300 text-neutral-950 px-3 py-1.5 rounded-full text-[11px] font-extrabold shadow-md animate-pulse">
                                        🎁 {freeSpinsCount} Спин
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="my-3 z-10">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md italic">
                                КОЛЕСО ПРИЗОВ
                            </h3>
                        </div>

                        <div className="relative my-4 z-10" ref={reelContainerRef}>
                            <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-30 text-amber-300 text-2xl filter drop-shadow-md">▼</div>
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[142px] h-[162px] border-4 border-amber-300 rounded-2xl z-20 pointer-events-none shadow-xl shadow-amber-500/30"></div>

                            <div className="overflow-hidden py-2 rounded-2xl">
                                <div 
                                    className="flex space-x-4 transition-transform ease-out"
                                    style={{ 
                                        transform: `translateX(-${reelTranslateX}px)`,
                                        transitionDuration: spinning ? '3700ms' : '0ms',
                                        transitionTimingFunction: 'cubic-bezier(0.1, 0.9, 0.2, 1)'
                                    }}
                                >
                                    {reelItems.map((item, idx) => (
                                        <div 
                                            key={idx}
                                            className={`min-w-[140px] w-[140px] h-[150px] bg-gradient-to-b ${item.bg} rounded-2xl p-3 flex flex-col justify-between text-white relative shadow-lg border border-white/20 shrink-0 select-none`}
                                        >
                                            {item.badge && (
                                                <div className="absolute -top-2 right-2 bg-yellow-400 text-neutral-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                                                    {item.badge}
                                                </div>
                                            )}
                                            <div className="text-left">
                                                <span className="text-[10px] font-bold uppercase opacity-80">
                                                    {item.type === 'jackpot' ? '⭐ СУПЕР' : 'Купон'}
                                                </span>
                                            </div>
                                            <div className="text-center my-auto">
                                                <div className={`text-2xl font-black leading-tight ${item.textDark ? 'text-neutral-950' : 'text-white'}`}>
                                                    {item.label}
                                                </div>
                                                <p className={`text-[10px] font-medium mt-1 opacity-90 ${item.textDark ? 'text-neutral-900' : 'text-neutral-200'}`}>
                                                    {item.subText}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="z-10 pt-2">
                            <button 
                                onClick={spinWheel} 
                                disabled={spinning}
                                className="w-full py-4 bg-neutral-950 hover:bg-neutral-900 active:scale-95 transition text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center space-x-2 border border-neutral-800"
                            >
                                <span>{spinning ? 'ВРАЩЕНИЕ...' : freeSpinsCount > 0 ? 'ВРАЩАТЬ (БЕСПЛАТНО)' : 'ВРАЩАТЬ 25'}</span>
                                {freeSpinsCount === 0 && (
                                    <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px]">🪙</span>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3 text-left space-y-2 mt-3">
                        <h4 className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">История прокруток</h4>
                        {spinHistory.length === 0 ? (
                            <p className="text-xs text-neutral-600">Нажмите «Вращать», чтобы испытать удачу!</p>
                        ) : (
                            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                                {spinHistory.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-xs border-b border-neutral-800 pb-1">
                                        <span className="text-neutral-500">{item.time}</span>
                                        <span className={`font-bold ${item.isWin ? 'text-amber-400' : 'text-neutral-500'}`}>
                                            {item.result}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'game' && (
                <div className="my-auto text-center space-y-2.5 pt-1 select-none">
                    <div className="grid grid-cols-2 gap-2">
                        <button 
                            onClick={() => handleSwitchMode('easy')} 
                            className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase transition ${gameMode === 'easy' ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' : 'bg-neutral-900 border border-neutral-800 text-neutral-400'}`}
                        >
                            ⭐ Легкая (без бонусов)
                        </button>
                        <button 
                            onClick={() => handleSwitchMode('hard')} 
                            className={`py-2 px-2 rounded-xl text-[11px] font-black uppercase transition ${gameMode === 'hard' ? 'bg-amber-500 text-neutral-950 shadow-lg shadow-amber-500/20' : 'bg-neutral-900 border border-neutral-800 text-neutral-400'}`}
                        >
                            🔥 Хардкор (+бонусы)
                        </button>
                    </div>

                    {gameMode === 'hard' && (
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={handleReturnTile}
                                className="py-2 px-2 bg-neutral-900 border border-amber-500/30 hover:border-amber-500 rounded-xl text-[10px] font-black uppercase text-amber-400 transition flex items-center justify-center space-x-1 shadow-md"
                            >
                                <span>↩️ Вернуть (15 🪙)</span>
                            </button>
                            <button 
                                onClick={handleShuffleBoard}
                                className="py-2 px-2 bg-neutral-900 border border-amber-500/30 hover:border-amber-500 rounded-xl text-[10px] font-black uppercase text-amber-400 transition flex items-center justify-center space-x-1 shadow-md"
                            >
                                <span>🔀 Перемешать (15 🪙)</span>
                            </button>
                        </div>
                    )}

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 text-left flex items-start space-x-2">
                        <span className="text-base">💡</span>
                        <div className="flex-1">
                            <p className="text-[10px] font-black text-amber-400 uppercase">Пивная мудрость</p>
                            <p className="text-[11px] text-neutral-300 leading-tight mt-0.5">{currentFact}</p>
                        </div>
                    </div>

                    <div className="bg-neutral-900 p-2.5 rounded-2xl border border-neutral-800 space-y-1.5 shadow-lg">
                        <div className="flex justify-between items-center text-xs font-black">
                            <span className="text-neutral-400">Уровень {gameLevel} (Цель: {currentTarget}):</span>
                            <span className="text-amber-400 text-sm">{gameScore} очков</span>
                        </div>
                        
                        <div className="w-full bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-800 p-0.5 relative">
                            <div 
                                className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((gameScore / currentTarget) * 100, 100)}%` }}
                            />
                        </div>

                        {comboCount > 1 && (
                            <div className="text-[10px] font-black text-amber-400 animate-bounce tracking-widest uppercase">
                                🔥 КОМБО x{comboCount}!
                            </div>
                        )}
                    </div>

                    <div className="bg-neutral-900/90 border-2 border-amber-500/40 p-2 rounded-2xl flex justify-center space-x-2.5 min-h-[62px] items-center shadow-2xl relative">
                        {Array.from({ length: 4 }).map((_, idx) => {
                            const tile = trayTiles[idx];
                            return (
                                <div key={idx} className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                                    {tile ? tile.icon : ''}
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-2xl min-h-[250px] relative overflow-hidden flex items-center justify-center shadow-inner">
                        {boardTiles.length === 0 ? (
                            <div className="text-center py-8 z-50">
                                <p className="text-amber-400 font-black text-base">🎉 ПОЛЕ ОЧИЩЕНО! Новый раунд</p>
                                <button onClick={() => initTileGame(gameMode)} className="mt-3 px-5 py-2.5 bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg">
                                    Продолжить игру
                                </button>
                            </div>
                        ) : (
                            <div className="relative w-[260px] h-[220px] mx-auto">
                                {boardTiles.map(tile => {
                                    const blocked = isTileBlocked(tile, boardTiles);
                                    
                                    return (
                                        <button
                                            key={tile.id}
                                            disabled={blocked}
                                            onClick={() => handleSelectTile(tile)}
                                            style={{
                                                left: `${tile.x}px`,
                                                top: `${tile.y}px`,
                                                zIndex: (tile.layer + 1) * 10,
                                            }}
                                            className={`absolute w-12 h-14 rounded-xl flex items-center justify-center text-2xl transition-all duration-150 ${
                                                blocked 
                                                    ? 'bg-neutral-900/90 border-2 border-neutral-700/60 text-neutral-400 shadow-[0_2px_0_#171717] cursor-not-allowed opacity-85' 
                                                    : 'bg-gradient-to-b from-amber-100 via-amber-200 to-amber-300 border-2 border-amber-400 text-neutral-950 shadow-[0_5px_0_#b45309] cursor-pointer hover:translate-y-[-1px] active:translate-y-[2px] active:shadow-[0_2px_0_#b45309]'
                                            }`}
                                        >
                                            {tile.icon}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'order' && (
                <div className="my-auto space-y-4 pt-2">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 shadow-xl">
                        <h3 className="text-lg font-black text-amber-400 uppercase tracking-tight">🌯 Быстрый предзаказ</h3>
                        <p className="text-xs text-neutral-400">Оформите предзаказ, чтобы не ждать в очереди.</p>

                        <form onSubmit={handleSendOrder} className="space-y-3 text-left">
                            <div>
                                <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Блюдо</label>
                                <select 
                                    value={selectedType} 
                                    onChange={e => setSelectedType(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                                >
                                    <option value="Традиционная">Шаурма Традиционная</option>
                                    <option value="Сырная">Шаурма Сырная</option>
                                    <option value="Острая">Шаурма Острая</option>
                                    <option value="Гирос">Гирос в пите</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Размер</label>
                                    <select 
                                        value={selectedSize} 
                                        onChange={e => setSelectedSize(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="Мини">Мини</option>
                                        <option value="Стандарт">Стандарт</option>
                                        <option value="Большая">Большая</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Соус</label>
                                    <select 
                                        value={selectedSauce} 
                                        onChange={e => setSelectedSauce(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="Фирменный">Фирменный</option>
                                        <option value="Тар-Тар">Тар-Тар</option>
                                        <option value="Острый">Острый</option>
                                        <option value="Чесночный">Чесночный</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Пожелания к заказу</label>
                                <textarea 
                                    value={orderNote}
                                    onChange={e => setOrderNote(e.target.value)}
                                    placeholder="Без лука, побольше соуса..."
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 h-20 resize-none"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isOrdering}
                                className="w-full py-3.5 bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition"
                            >
                                {isOrdering ? 'Отправка...' : 'Отправить предзаказ'}
                            </button>

                            {orderSuccess && (
                                <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-xl text-center text-xs font-bold">
                                    ✅ Предзаказ успешно отправлен! Бармен уже готовит.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'promotions' && (
                <div className="my-auto space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-left">Актуальные акции</h3>
                    {promotions.length === 0 ? (
                        <div className="p-8 text-center bg-neutral-900 border border-neutral-800 rounded-2xl">
                            <p className="text-xs text-neutral-500">Загрузка акций или список пуст...</p>
                        </div>
                    ) : (
                        promotions.map(promo => (
                            <div key={promo.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl text-left space-y-1 shadow-lg">
                                <span className="inline-block px-2 py-0.5 bg-amber-500/20 text-amber-400 font-bold text-[10px] rounded mb-1">
                                    {promo.badge || 'АКЦИЯ'}
                                </span>
                                <h4 className="font-black text-white text-base">{promo.title}</h4>
                                <p className="text-xs text-neutral-400 leading-relaxed">{promo.desc}</p>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'contacts' && (
                <div className="my-auto space-y-4 pt-4 text-left">
                    <h3 className="text-lg font-black text-amber-400 text-center">📞 Контакты & Сообщество</h3>

                    <a href="tel:+79991234567" className="block bg-amber-500 text-neutral-950 p-4 rounded-2xl text-center font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/10">
                        📞 Позвонить в заведение
                    </a>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase">Мы в социальных сетях:</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <a href="https://vk.com" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block">ВКонтакте</a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block">Instagram</a>
                            <a href="https://t.me" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block">Telegram-канал</a>
                            <a href="https://example.com" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block">Наш сайт</a>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase">Присоединяйтесь к чатам:</h4>
                        <div className="space-y-2">
                            <a href="https://t.me" target="_blank" rel="noreferrer" className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-3 rounded-xl text-xs font-bold flex justify-between items-center">
                                <span>Чат-группа в Telegram</span> ➔
                            </a>
                            <a href="https://wa.me" target="_blank" rel="noreferrer" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-bold flex justify-between items-center">
                                <span>Чат-группа в WhatsApp</span> ➔
                            </a>
                            <a href="https://max.ru" target="_blank" rel="noreferrer" className="bg-purple-500/10 border border-purple-500/20 text-purple-400 p-3 rounded-xl text-xs font-bold flex justify-between items-center">
                                <span>Чат-группа в Max</span> ➔
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-neutral-900/95 border-t border-neutral-800 backdrop-blur-lg px-1 py-2 flex justify-around items-center z-40">
                {[
                    { id: 'card', icon: '💳', label: 'Карта' },
                    { id: 'wheel', icon: '🎰', label: 'Рулетка' },
                    { id: 'game', icon: '🧩', label: 'Игра' },
                    { id: 'order', icon: '🌯', label: 'Заказ' },
                    { id: 'promotions', icon: '🔥', label: 'Акции' },
                    { id: 'contacts', icon: '📞', label: 'Связь' }
                ].map(tab => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)} 
                        className={`flex flex-col items-center p-1 rounded-xl transition ${activeTab === tab.id ? 'text-amber-400 font-black scale-105' : 'text-neutral-500'}`}
                    >
                        <span className="text-lg">{tab.icon}</span>
                        <span className="text-[8px] mt-0.5 uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>

            {winModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
                        <h3 className="font-black text-xl text-amber-400">{winModal.title}</h3>
                        <p className="text-xs text-neutral-300 leading-relaxed">{winModal.desc}</p>
                        <button onClick={() => setWinModal(null)} className="w-full py-3 bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider">Отлично</button>
                    </div>
                </div>
            )}

            {dailyBonusModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
                        <div className="text-4xl">🎁</div>
                        <h3 className="font-black text-lg text-white">Ежедневная награда!</h3>
                        <p className="text-xs text-neutral-300">День {dailyBonusModal.day}! Вам начислено <strong className="text-amber-400">+{dailyBonusModal.reward} бонусов</strong>.</p>
                        <button onClick={() => setDailyBonusModal(null)} className="w-full py-3 bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider">Забрать</button>
                    </div>
                </div>
            )}

            {gameOverModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
                        <div className="text-4xl">💥</div>
                        <h3 className="font-black text-lg text-white">Лоток переполнен!</h3>
                        <p className="text-xs text-neutral-400">Слоты заполнены. Очки сброшены. Попробуйте еще раз!</p>
                        <button onClick={() => setGameOverModal(false)} className="w-full py-3 bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase tracking-wider">Попробовать снова</button>
                    </div>
                </div>
            )}

            {legalModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-xs w-full text-left space-y-3 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <h3 className="font-black text-sm text-amber-400 uppercase">{legalModal === 'terms' ? 'Пользовательское соглашение' : 'Политика конфиденциальности'}</h3>
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                            {legalModal === 'terms'
                                ? 'Карта лояльности ПИВКУЛЬТУРА предоставляет право накапливать и списывать бонусы при совершении покупок. 1 бонус = 1 рубль. Бонусы не подлежат обмену на наличные средства.'
                                : 'Мы сохраняем ваш номер телефона исключительно для авторизации в программе лояльности и учета бонусных баллов. Данные не передаются третьим лицам.'
                            }
                        </p>
                        <button onClick={() => setLegalModal(null)} className="w-full py-2.5 bg-neutral-800 text-white font-bold rounded-xl text-xs uppercase">Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
}