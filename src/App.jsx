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

    const [selectedGame, setSelectedGame] = useState('menu');
    const [promotions, setPromotions] = useState([]);
    const [dailyBonusModal, setDailyBonusModal] = useState(null);
    const [gameOverModal, setGameOverModal] = useState(false);

    const [victoryAnim, setVictoryAnim] = useState(false);

    const [spinning, setSpinning] = useState(false);
    const [winModal, setWinModal] = useState(null);
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

    const [ticketCount, setTicketCount] = useState(1);
    const [lottoTickets, setLottoTickets] = useState([]);
    const [drawnBarrels, setDrawnBarrels] = useState([]);
    const [currentBarrel, setCurrentBarrel] = useState(null);
    const [lottoStatus, setLottoStatus] = useState('ready'); 
    const [lottoMessage, setLottoMessage] = useState('');

    // Состояния для «Тайник бармена»
    const [monteBet, setMonteBet] = useState(10);
    const [monteStatus, setMonteStatus] = useState('ready');
    const [winningCup, setWinningCup] = useState(null);
    const [chosenCup, setChosenCup] = useState(null);
    const [monteMessage, setMonteMessage] = useState('');
    const [isShufflingAnimation, setIsShufflingAnimation] = useState(false);

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
    }, []);

    useEffect(() => {
        if (!phone) return;
        const interval = setInterval(() => {
            fetchCustomerData(phone, true);
        }, 5000);
        return () => clearInterval(interval);
    }, [phone]);

    const triggerVictoryEffect = () => {
        setVictoryAnim(true);
        setTimeout(() => setVictoryAnim(false), 2500);
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

    const generateLottoTicket = () => {
        let rows = [];
        for (let r = 0; r < 3; r++) {
            let rowNums = [];
            while (rowNums.length < 5) {
                let randNum = Math.floor(Math.random() * 90) + 1;
                if (!rowNums.includes(randNum)) rowNums.push(randNum);
            }
            rowNums.sort((a, b) => a - b);
            
            let rowCells = Array(9).fill(null);
            let placed = 0;
            while(placed < 5) {
                let pos = Math.floor(Math.random() * 9);
                if (rowCells[pos] === null) {
                    rowCells[pos] = { num: rowNums[placed], checked: false };
                    placed++;
                }
            }
            rows.push(rowCells);
        }
        return { id: Math.random(), rows };
    };

    const startNewLottoGame = async () => {
        const cost = ticketCount * 20; 
        if ((customer.balance || 0) < cost) {
            alert(`Недостаточно бонусов! Стоимость ${ticketCount} билетов — ${cost} бонусов.`);
            return;
        }
        await addBonusToDB(-cost);

        let tickets = [];
        for(let i=0; i<ticketCount; i++) {
            tickets.push(generateLottoTicket());
        }
        setLottoTickets(tickets);
        setDrawnBarrels([]);
        setCurrentBarrel(null);
        setLottoStatus('playing');
        setLottoMessage('🎲 Тяните бочонки и зачеркивайте совпадения!');
    };

    const drawBarrel = () => {
        if (lottoStatus !== 'playing') return;
        let available = [];
        for (let i = 1; i <= 90; i++) {
            if (!drawnBarrels.includes(i)) available.push(i);
        }

        if (available.length === 0 || drawnBarrels.length >= 25) {
            checkLottoWin(false);
            return;
        }

        const nextNum = available[Math.floor(Math.random() * available.length)];
        const newDrawn = [...drawnBarrels, nextNum];
        setDrawnBarrels(newDrawn);
        setCurrentBarrel(nextNum);
    };

    const handleCellClick = (ticketIdx, rowIdx, cellIdx) => {
        if (lottoStatus !== 'playing') return;
        let ticketsCopy = [...lottoTickets];
        let cell = ticketsCopy[ticketIdx].rows[rowIdx][cellIdx];
        if (!cell) return;
        
        if (drawnBarrels.includes(cell.num)) {
            cell.checked = !cell.checked;
            setLottoTickets(ticketsCopy);
            checkLottoWin(ticketsCopy);
        } else {
            setLottoMessage('⚠️ Этот бочонок еще не выпадал!');
        }
    };

    const checkLottoWin = async (currentTickets = lottoTickets) => {
        let hasWonRow = false;
        currentTickets.forEach(ticket => {
            ticket.rows.forEach(row => {
                let activeCells = row.filter(c => c !== null);
                let allChecked = activeCells.length > 0 && activeCells.every(c => c.checked);
                if (allChecked) hasWonRow = true;
            });
        });

        if (hasWonRow) {
            setLottoStatus('win');
            const prize = ticketCount * 60;
            await addBonusToDB(prize);
            triggerVictoryEffect();
            setLottoMessage(`🎉 ПОБЕДА! Собрана линия, ваш приз: +${prize} бонусов! 🪙`);
        } else if (drawnBarrels.length >= 25) {
            setLottoStatus('lose');
            setLottoMessage('😔 Ходы закончились. Попробуйте еще раз!');
        }
    };

    // Тайник бармена: без показа в начале, сразу закрытые кружки и перемешивание
    const startMonteGame = async () => {
        if ((customer.balance || 0) < monteBet) {
            alert('Недостаточно бонусов для ставки!');
            return;
        }
        await addBonusToDB(-monteBet);
        setMonteStatus('shuffling');
        setIsShufflingAnimation(true);
        setChosenCup(null);

        const hidden = Math.floor(Math.random() * 3) + 1;
        setWinningCup(hidden);
        setMonteMessage('🔄 Кружки перемешиваются на столе...');

        setTimeout(() => {
            setIsShufflingAnimation(false);
            setMonteStatus('choose');
            setMonteMessage('✨ Выберите кружку, под которой спрятана золотая пинта!');
        }, 1500);
    };

    const chooseMonteCup = async (cupIndex) => {
        if (monteStatus !== 'choose') return;
        setChosenCup(cupIndex);
        if (cupIndex === winningCup) {
            setMonteStatus('win');
            const reward = monteBet * 2;
            await addBonusToDB(reward);
            triggerVictoryEffect();
            setMonteMessage(`🎉 УГАДАЛИ! Золотая пинта найдена! Выигрыш: +${reward} бонусов!`);
        } else {
            setMonteStatus('lose');
            setMonteMessage(`❌ МИМО! Пинта была под кружкой №${winningCup}. Попробуйте снова!`);
        }
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
                alert('Лимит в 3 попытки на сегодня исчерпан!');
                return;
            }
            if ((customer.balance || 0) < 25) {
                alert('Недостаточно бонусов! Стоимость — 25 бонусов.');
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
            if (isWin) triggerVictoryEffect();

            if (randomWinPrize.type === 'bonus') {
                await addBonusToDB(randomWinPrize.value);
                setWinModal({ title: '🎉 ВЫИГРЫШ!', desc: `Вы выиграли ${randomWinPrize.value} бонусов!` });
            } else if (randomWinPrize.type === 'promo') {
                setWinModal({ title: '🌯 СУПЕР ПРИЗ!', desc: 'Вы выиграли скидку 50% на Шаурму Мини!' });
            } else if (randomWinPrize.type === 'free_spin') {
                setFreeSpinsCount(prev => prev + 1);
                setWinModal({ title: '🎁 БОНУС!', desc: 'Вы выиграли +1 бесплатный прокрут!' });
            } else {
                setWinModal({ title: '😔 УПС...', desc: 'В этот раз ничего не выпало.' });
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

                    // Исправлено: убран риск повторного триггера и скачка уровня
                    if (newScore >= currentTarget) {
                        triggerVictoryEffect();
                        if (gameMode === 'hard') {
                            addBonusToDB(100);
                            alert(`🎉 УРОВЕНЬ ${gameLevel} ПРОЙДЕН! Награда: +100 бонусов за Хардкор!`);
                        } else {
                            alert(`🎉 УРОВЕНЬ ${gameLevel} ПРОЙДЕН! Переходим дальше.`);
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
                .insert({
                    customer_phone: phone,
                    customer_name: customer?.name || 'Гость',
                    type: selectedType,
                    size: selectedSize,
                    sauce: selectedSauce,
                    note: orderNote,
                    status: 'new'
                });
            if (error) throw error;
            setOrderSuccess(true);
            setTimeout(() => setOrderSuccess(false), 5000);
        } catch (err) {
            console.error('Ошибка:', err);
            alert('Не удалось отправить заказ.');
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
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-4 text-center text-xl font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-4 bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-amber-400 transition"
                        >
                            {loading ? 'Загрузка...' : 'Открыть карту'}
                        </button>
                    </form>
                    <div className="pt-2 border-t border-neutral-800">
                        <p className="text-[11px] text-neutral-400 leading-relaxed">
                            Еще не зарегистрированы в клубе? Просто назовите ваш номер бармену при следующем визите, и мы заведем карту на кассе!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 font-sans flex flex-col justify-between max-w-md mx-auto pb-24 relative overflow-hidden">
            
            {victoryAnim && (
                <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-amber-500/10 animate-ping"></div>
                    <div className="text-6xl animate-bounce">🏆 ✨ 🎉</div>
                </div>
            )}

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
                    <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 text-neutral-950 shadow-2xl space-y-6">
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
                </div>
            )}

            {activeTab === 'wheel' && (
                <div className="my-auto pt-2 space-y-4">
                    <div className="bg-gradient-to-b from-orange-500 via-orange-600 to-amber-600 rounded-3xl p-5 text-center shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="flex items-center justify-between z-10">
                            <div className="bg-white/90 text-neutral-950 px-3 py-1.5 rounded-full flex items-center space-x-1.5 shadow-md">
                                <span className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[11px] font-black text-white">🪙</span>
                                <span className="font-extrabold text-xs">{customer.balance || 0}</span>
                            </div>
                            {freeSpinsCount > 0 && (
                                <span className="bg-amber-300 text-neutral-950 px-3 py-1.5 rounded-full text-[11px] font-extrabold shadow-md animate-pulse">
                                    🎁 {freeSpinsCount} Спин
                                </span>
                            )}
                        </div>

                        <div className="my-2 z-10">
                            <h3 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md italic">
                                КОЛЕСО ПРИЗОВ
                            </h3>
                        </div>

                        <div className="relative my-3 z-10" ref={reelContainerRef}>
                            <div className="absolute left-1/2 -top-3 -translate-x-1/2 z-30 text-amber-300 text-2xl filter drop-shadow-md">▼</div>
                            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[142px] h-[162px] border-4 border-amber-300 rounded-2xl z-20 pointer-events-none shadow-xl"></div>

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

                        <div className="z-10 pt-1">
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
                </div>
            )}

            {activeTab === 'game' && (
                <div className="my-auto text-center space-y-3 pt-1 select-none">
                    
                    {selectedGame === 'menu' && (
                        <div className="space-y-4 py-4">
                            <div className="text-left mb-2">
                                <h3 className="text-base font-black text-amber-400 uppercase tracking-tight">🎮 Игровой зал</h3>
                                <p className="text-xs text-neutral-400">Выберите мини-игру:</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => setSelectedGame('tiles')}
                                    className="p-4 bg-neutral-900 border border-neutral-800 hover:border-amber-500 rounded-2xl text-left space-y-2 transition group shadow-lg flex flex-col justify-between h-32"
                                >
                                    <span className="text-2xl">🧩</span>
                                    <div>
                                        <h4 className="font-black text-xs uppercase text-white group-hover:text-amber-400">Плитки (Маджонг)</h4>
                                        <p className="text-[10px] text-neutral-500 mt-0.5">Собирай тройки фишек</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setSelectedGame('lotto')}
                                    className="p-4 bg-neutral-900 border border-neutral-800 hover:border-amber-500 rounded-2xl text-left space-y-2 transition group shadow-lg flex flex-col justify-between h-32"
                                >
                                    <span className="text-2xl">🎲</span>
                                    <div>
                                        <h4 className="font-black text-xs uppercase text-white group-hover:text-amber-400">Русское Лото</h4>
                                        <p className="text-[10px] text-neutral-500 mt-0.5">Свои билеты и бочонки</p>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => setSelectedGame('monte')}
                                    className="p-4 bg-neutral-900 border border-neutral-800 hover:border-amber-500 rounded-2xl text-left space-y-2 transition group shadow-lg flex flex-col justify-between h-32"
                                >
                                    <span className="text-2xl">🍺</span>
                                    <div>
                                        <h4 className="font-black text-xs uppercase text-white group-hover:text-amber-400">Тайник бармена</h4>
                                        <p className="text-[10px] text-neutral-500 mt-0.5">Угадай кружку со ставкой</p>
                                    </div>
                                </button>

                                <div className="p-4 bg-neutral-950 border border-dashed border-neutral-800 rounded-2xl text-left space-y-2 opacity-60 flex flex-col justify-between h-32">
                                    <span className="text-2xl">🔒</span>
                                    <div>
                                        <h4 className="font-black text-xs uppercase text-neutral-400">Скоро...</h4>
                                        <p className="text-[10px] text-neutral-600 mt-0.5">Новая мини-игра</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Тайник бармена: без показа пинты в самом начале */}
                    {selectedGame === 'monte' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-5 space-y-4 text-left shadow-2xl relative overflow-hidden">
                            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                                <button 
                                    onClick={() => setSelectedGame('menu')}
                                    className="text-[10px] font-black text-neutral-400 hover:text-white uppercase bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800"
                                >
                                    ← Назад к играм
                                </button>
                                <h3 className="text-xs font-black text-amber-400 uppercase">🍺 Тайник бармена</h3>
                            </div>

                            {monteStatus === 'ready' && (
                                <div className="space-y-4 py-2 text-center">
                                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2">
                                        <span className="text-3xl">🍻</span>
                                        <p className="text-xs text-neutral-300 font-medium">Золотая пинта спрятана под одной из кружек. Кружки перемешиваются в закрытом виде. Угадайте правильную кружку, чтобы умножить ставку в <strong>2 раза</strong>!</p>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-neutral-400 uppercase">Выберите ставку:</label>
                                        <div className="flex justify-center space-x-2">
                                            {[10, 25, 50, 100].map(val => (
                                                <button 
                                                    key={val}
                                                    onClick={() => setMonteBet(val)}
                                                    className={`px-3.5 py-2.5 rounded-xl text-xs font-black transition ${monteBet === val ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20' : 'bg-neutral-950 border border-neutral-800 text-neutral-400'}`}
                                                >
                                                    {val} 🪙
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button 
                                        onClick={startMonteGame}
                                        className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl transition shadow-xl"
                                    >
                                        Начать игру ({monteBet} 🪙)
                                    </button>
                                </div>
                            )}

                            {(monteStatus === 'shuffling' || monteStatus === 'choose' || monteStatus === 'win' || monteStatus === 'lose') && (
                                <div className="space-y-4 py-2 text-center">
                                    <div className="bg-neutral-950/80 border border-neutral-800 p-3 rounded-2xl">
                                        <p className="text-xs font-black text-amber-400 animate-pulse">{monteMessage}</p>
                                    </div>

                                    {/* Стол бармена */}
                                    <div className="relative h-44 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center overflow-hidden">
                                        <div className="absolute inset-x-0 bottom-0 h-10 bg-neutral-900 border-t border-neutral-800 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest">Барная стойка</span>
                                        </div>

                                        <div className={`flex justify-center space-x-5 transition-transform duration-500 ${isShufflingAnimation ? 'animate-bounce' : ''}`}>
                                            {[1, 2, 3].map(cup => {
                                                const isSelected = chosenCup === cup;
                                                const isWinning = winningCup === cup;
                                                
                                                // Пинта открывается только после выбора игрока (при победе или поражении)
                                                const showPyramid = (monteStatus === 'win' || monteStatus === 'lose') && isWinning;

                                                return (
                                                    <button
                                                        key={cup}
                                                        disabled={monteStatus !== 'choose'}
                                                        onClick={() => chooseMonteCup(cup)}
                                                        className={`w-20 h-28 rounded-2xl flex flex-col items-center justify-between p-3 transition-all border relative z-10 ${
                                                            isSelected 
                                                                ? 'border-amber-400 bg-amber-500/20 scale-105 shadow-xl shadow-amber-500/30 -translate-y-2' 
                                                                : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'
                                                        }`}
                                                    >
                                                        <div className="h-8 flex items-center justify-center">
                                                            {showPyramid && (
                                                                <span className="text-2xl animate-bounce filter drop-shadow">⭐</span>
                                                            )}
                                                        </div>

                                                        <div className="text-3xl select-none">
                                                            {showPyramid ? '🍺' : '🏺'}
                                                        </div>

                                                        <span className={`text-[10px] font-black uppercase ${isSelected ? 'text-amber-400' : 'text-neutral-400'}`}>
                                                            № {cup}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {(monteStatus === 'win' || monteStatus === 'lose') && (
                                        <button 
                                            onClick={() => setMonteStatus('ready')}
                                            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition"
                                        >
                                            Сыграть еще раз
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedGame === 'lotto' && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3 text-left shadow-xl">
                            <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                                <button 
                                    onClick={() => setSelectedGame('menu')}
                                    className="text-[10px] font-black text-neutral-400 hover:text-white uppercase bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800"
                                >
                                    ← Назад к играм
                                </button>
                                <h3 className="text-xs font-black text-amber-400 uppercase">🎲 Русское Лото</h3>
                            </div>

                            {lottoStatus === 'ready' && (
                                <div className="text-center py-4 space-y-4">
                                    <p className="text-xs text-neutral-300">Выберите количество билетов для участия в тираже (20 бонусов за 1 билет):</p>
                                    
                                    <div className="flex items-center justify-center space-x-4">
                                        <button 
                                            onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                                            className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl font-black text-lg"
                                        >-</button>
                                        <span className="text-lg font-black text-amber-400">{ticketCount} {ticketCount === 1 ? 'билет' : ticketCount < 5 ? 'билета' : 'билетов'}</span>
                                        <button 
                                            onClick={() => setTicketCount(Math.min(3, ticketCount + 1))}
                                            className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-xl font-black text-lg"
                                        >+</button>
                                    </div>

                                    <button 
                                        onClick={startNewLottoGame}
                                        className="w-full py-3.5 bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition shadow-lg"
                                    >
                                        Начать игру ({ticketCount * 20} 🪙)
                                    </button>
                                </div>
                            )}

                            {lottoStatus !== 'ready' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-10 h-10 bg-amber-500 text-neutral-950 rounded-full font-black text-base flex items-center justify-center shadow-md animate-bounce">
                                                {currentBarrel || '?'}
                                            </div>
                                            <span className="text-[11px] text-neutral-400 font-bold uppercase">Бочонок</span>
                                        </div>

                                        {lottoStatus === 'playing' && (
                                            <button 
                                                onClick={drawBarrel}
                                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase rounded-xl transition"
                                            >
                                                Тянуть бочонок 🛢️
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                        {lottoTickets.map((ticket, tIdx) => (
                                            <div key={ticket.id} className="bg-amber-100/10 border border-amber-500/30 p-2 rounded-xl space-y-1">
                                                <p className="text-[9px] font-black text-amber-400 uppercase">Карточка #{tIdx + 1}</p>
                                                {ticket.rows.map((row, rIdx) => (
                                                    <div key={rIdx} className="grid grid-cols-9 gap-1">
                                                        {row.map((cell, cIdx) => (
                                                            <button
                                                                key={cIdx}
                                                                disabled={!cell || lottoStatus !== 'playing'}
                                                                onClick={() => handleCellClick(tIdx, rIdx, cIdx)}
                                                                className={`h-6 rounded text-[10px] font-black flex items-center justify-center transition ${
                                                                    !cell 
                                                                        ? 'bg-neutral-950/40 border border-neutral-800 opacity-20 cursor-default' 
                                                                        : cell.checked 
                                                                            ? 'bg-amber-500 text-neutral-950 shadow-md scale-95' 
                                                                            : drawnBarrels.includes(cell.num)
                                                                                ? 'bg-neutral-800 text-amber-400 border border-amber-500 animate-pulse'
                                                                                : 'bg-neutral-950 text-neutral-300 border border-neutral-800'
                                                                }`}
                                                            >
                                                                {cell ? cell.num : ''}
                                                            </button>
                                                        ))}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>

                                    {lottoMessage && (
                                        <div className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-center text-xs font-bold text-amber-400">
                                            {lottoMessage}
                                        </div>
                                    )}

                                    {(lottoStatus === 'win' || lottoStatus === 'lose') && (
                                        <button 
                                            onClick={() => setLottoStatus('ready')}
                                            className="w-full py-2.5 bg-amber-500 text-neutral-950 font-black text-xs uppercase rounded-xl"
                                        >
                                            Сыграть еще раз
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {selectedGame === 'tiles' && (
                        <div className="space-y-2.5">
                            <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-2 rounded-xl">
                                <button 
                                    onClick={() => setSelectedGame('menu')}
                                    className="text-[10px] font-black text-neutral-400 hover:text-white uppercase bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800"
                                >
                                    ← Назад к играм
                                </button>
                                <div className="flex space-x-1">
                                    <button 
                                        onClick={() => handleSwitchMode('easy')} 
                                        className={`py-1 px-2.5 rounded-lg text-[10px] font-black uppercase transition ${gameMode === 'easy' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'}`}
                                    >
                                        Легкая
                                    </button>
                                    <button 
                                        onClick={() => handleSwitchMode('hard')} 
                                        className={`py-1 px-2.5 rounded-lg text-[10px] font-black uppercase transition ${gameMode === 'hard' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400'}`}
                                    >
                                        Хардкор (+100 🪙)
                                    </button>
                                </div>
                            </div>

                            <div className="bg-neutral-900 p-3 rounded-xl border border-neutral-800 space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-black">
                                    <span className="text-neutral-400">Уровень {gameLevel}:</span>
                                    <span className="text-amber-400">{gameScore} / {currentTarget} очков</span>
                                </div>
                                <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                                    <div 
                                        className="bg-amber-500 h-full transition-all duration-300"
                                        style={{ width: `${Math.min(100, (gameScore / currentTarget) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="bg-neutral-900/90 border border-amber-500/20 p-2.5 rounded-xl text-left flex items-start space-x-2">
                                <span className="text-base">💡</span>
                                <div>
                                    <p className="text-[10px] font-black text-amber-400 uppercase">Пивная мудрость</p>
                                    <p className="text-[10px] text-neutral-300 leading-tight mt-0.5">{currentFact}</p>
                                </div>
                            </div>

                            <div className="bg-neutral-900/90 border border-amber-500/30 p-1.5 rounded-xl flex justify-center space-x-2 min-h-[50px] items-center">
                                {Array.from({ length: 4 }).map((_, idx) => {
                                    const tile = trayTiles[idx];
                                    return (
                                        <div key={idx} className="w-10 h-10 bg-neutral-950 border border-neutral-800 rounded-lg flex items-center justify-center text-xl shadow-inner">
                                            {tile ? tile.icon : ''}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-neutral-950 border border-neutral-800 p-2 rounded-xl min-h-[190px] relative overflow-hidden flex items-center justify-center">
                                {boardTiles.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-amber-400 font-black text-sm">🎉 ПОЛЕ ОЧИЩЕНО!</p>
                                        <button onClick={() => initTileGame(gameMode)} className="mt-2 px-4 py-2 bg-amber-500 text-neutral-950 font-black rounded-lg text-xs uppercase">
                                            Следующий раунд
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative w-[240px] h-[180px] mx-auto">
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
                                                    className={`absolute w-10 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                                                        blocked 
                                                            ? 'bg-neutral-900/90 border border-neutral-700 text-neutral-500 cursor-not-allowed opacity-80' 
                                                            : 'bg-gradient-to-b from-amber-100 to-amber-300 border border-amber-400 text-neutral-950 shadow-[0_4px_0_#b45309] cursor-pointer active:translate-y-[2px]'
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
                                <label className="text-[11px] font-bold text-neutral-400 uppercase block mb-1">Комментарий к заказу</label>
                                <input 
                                    type="text" 
                                    placeholder="Без лука, побольше салфеток..."
                                    value={orderNote}
                                    onChange={e => setOrderNote(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={isOrdering}
                                className="w-full py-3.5 bg-amber-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl hover:bg-amber-400 transition shadow-lg"
                            >
                                {isOrdering ? 'Отправка...' : 'Отправить предзаказ'}
                            </button>

                            {orderSuccess && (
                                <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-center text-xs font-bold">
                                    ✅ Предзаказ успешно отправлен! Ожидайте подтверждения.
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {activeTab === 'promotions' && (
                <div className="my-auto space-y-3 pt-2">
                    <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider text-left">Актуальные акции</h3>
                    {promotions.map(promo => (
                        <div key={promo.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-2xl text-left space-y-1">
                            <h4 className="font-black text-white text-base">{promo.title}</h4>
                            <p className="text-xs text-neutral-400">{promo.desc}</p>
                        </div>
                    ))}
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
                            <a href="https://vk.com" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block hover:border-amber-500">ВКонтакте</a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block hover:border-amber-500">Instagram</a>
                            <a href="https://t.me" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block hover:border-amber-500">Telegram-канал</a>
                            <a href="https://example.com" target="_blank" rel="noreferrer" className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-xs font-bold text-center block hover:border-amber-500">Наш сайт</a>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold text-neutral-400 uppercase">Присоединяйтесь к чатам:</h4>
                        <div className="space-y-2">
                            <a href="https://t.me" target="_blank" rel="noreferrer" className="bg-sky-500/10 border border-sky-500/20 text-sky-400 p-3 rounded-xl text-xs font-bold flex justify-between items-center hover:bg-sky-500/20">
                                <span>Чат-группа в Telegram</span> ➔
                            </a>
                            <a href="https://wa.me" target="_blank" rel="noreferrer" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-bold flex justify-between items-center hover:bg-emerald-500/20">
                                <span>Чат-группа в WhatsApp</span> ➔
                            </a>
                            <a href="https://max.ru" target="_blank" rel="noreferrer" className="bg-purple-500/10 border border-purple-500/20 text-purple-400 p-3 rounded-xl text-xs font-bold flex justify-between items-center hover:bg-purple-500/20">
                                <span>Чат-группа в Max</span> ➔
                            </a>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-4 pt-2 text-[10px] text-neutral-500 font-bold uppercase">
                        <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('Политика конфиденциальности: Ваши данные защищены и используются исключительно для начисления бонусов.'); }} className="underline hover:text-neutral-300">Политика конфиденциальности</a>
                        <span>•</span>
                        <a href="#terms" onClick={(e) => { e.preventDefault(); alert('Пользовательское соглашение: Участвуя в бонусной программе, вы соглашаетесь с правилами заведения.'); }} className="underline hover:text-neutral-300">Соглашение</a>
                    </div>
                </div>
            )}

            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-neutral-900/95 border-t border-neutral-800 px-1 py-2 flex justify-around items-center z-40">
                {[
                    { id: 'card', icon: '💳', label: 'Карта' },
                    { id: 'wheel', icon: '🎰', label: 'Рулетка' },
                    { id: 'game', icon: '🧩', label: 'Игры' },
                    { id: 'order', icon: '🌯', label: 'Заказ' },
                    { id: 'promotions', icon: '🔥', label: 'Акция' },
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
                        <p className="text-xs text-neutral-300">{winModal.desc}</p>
                        <button onClick={() => setWinModal(null)} className="w-full py-3 bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase">Отлично</button>
                    </div>
                </div>
            )}

            {dailyBonusModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
                        <div className="text-4xl">🎁</div>
                        <h3 className="font-black text-lg text-white">Ежедневная награда!</h3>
                        <p className="text-xs text-neutral-300">Вам начислено <strong className="text-amber-400">+{dailyBonusModal.reward} бонусов</strong>.</p>
                        <button onClick={() => setDailyBonusModal(null)} className="w-full py-3 bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase">Забрать</button>
                    </div>
                </div>
            )}

            {gameOverModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-3xl max-w-xs w-full text-center space-y-4 shadow-2xl">
                        <div className="text-4xl">💥</div>
                        <h3 className="font-black text-lg text-white">Лоток переполнен!</h3>
                        <p className="text-xs text-neutral-400">Очки сброшены. Попробуйте еще раз!</p>
                        <button onClick={() => setGameOverModal(false)} className="w-full py-3 bg-amber-500 text-neutral-950 font-black rounded-xl text-xs uppercase">Попробовать снова</button>
                    </div>
                </div>
            )}
        </div>
    );
}