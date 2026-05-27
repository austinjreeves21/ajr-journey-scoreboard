import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Flame,
  RotateCcw,
  Trophy,
  AlertTriangle,
  Save,
  CalendarDays,
  Target,
  Zap,
  TrendingUp,
  DollarSign,
  ClipboardList,
  BellRing,
  Bot,
  Loader2,
} from 'lucide-react';

const todayKey = () => new Date().toISOString().slice(0, 10);
const SCORE_MAX = 25;

function getDateOffset(dateString, offset) {
  const d = new Date(`${dateString}T00:00:00`);
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-[2rem] bg-slate-950/75 border border-slate-800 shadow-xl ${className}`}>
      {children}
    </div>
  );
}

function CardContent({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

function Button({
  children,
  onClick,
  variant = 'default',
  className = '',
  type = 'button',
  disabled = false,
}) {
  const base =
    'inline-flex items-center justify-center px-4 py-2 font-bold transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const styles =
    variant === 'outline'
      ? 'border border-slate-700 text-slate-200 bg-transparent hover:bg-slate-900'
      : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white hover:brightness-110';

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

export default function JourneyScoreboardApp() {
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const [liAppointments, setLiAppointments] = useState(0);
  const [mediaAppointments, setMediaAppointments] = useState(0);
  const [fitnessAppointments, setFitnessAppointments] = useState(0);
  const [otherAppointments, setOtherAppointments] = useState(0);

  const [dialing, setDialing] = useState(false);
  const [mediaOutreach, setMediaOutreach] = useState(false);

  const [videosPosted, setVideosPosted] = useState(0);
  const [contentCTA, setContentCTA] = useState(false);
  const [contentConversation, setContentConversation] = useState(false);

  const [fitnessRings, setFitnessRings] = useState(false);

  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [nutritionTracked, setNutritionTracked] = useState(false);

  const [sleep, setSleep] = useState(false);
  const [moneyMade, setMoneyMade] = useState('');
  const [tomorrowMission, setTomorrowMission] = useState('');
  const [failedPrompt, setFailedPrompt] = useState('');

  const [aiReview, setAiReview] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const [history, setHistory] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('ajrJourneyScoreboardHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function resetInputsOnly() {
    setLiAppointments(0);
    setMediaAppointments(0);
    setFitnessAppointments(0);
    setOtherAppointments(0);
    setDialing(false);
    setMediaOutreach(false);
    setVideosPosted(0);
    setContentCTA(false);
    setContentConversation(false);
    setFitnessRings(false);
    setCalories('');
    setProtein('');
    setNutritionTracked(false);
    setSleep(false);
    setMoneyMade('');
    setTomorrowMission('');
    setFailedPrompt('');
    setAiReview('');
    setAiError('');
  }

  useEffect(() => {
    const day = history[selectedDate];

    if (day) {
      setLiAppointments(day.liAppointments ?? day.appointments ?? 0);
      setMediaAppointments(day.mediaAppointments || 0);
      setFitnessAppointments(day.fitnessAppointments || 0);
      setOtherAppointments(day.otherAppointments || 0);
      setDialing(!!day.dialing);
      setMediaOutreach(!!day.mediaOutreach);
      setVideosPosted(day.videosPosted || 0);
      setContentCTA(!!day.contentCTA);
      setContentConversation(!!day.contentConversation);
      setFitnessRings(!!day.fitnessRings);
      setCalories(day.calories ?? '');
      setProtein(day.protein ?? '');
      setNutritionTracked(!!day.nutritionTracked);
      setSleep(!!day.sleep);
      setMoneyMade(day.moneyMade ?? '');
      setTomorrowMission(day.tomorrowMission ?? '');
      setFailedPrompt(day.failedPrompt ?? '');
    } else {
      resetInputsOnly();
    }
  }, [selectedDate, history]);

  const appointments = liAppointments + mediaAppointments + fitnessAppointments + otherAppointments;

  const caloriesNum = Number(calories);
  const proteinNum = Number(protein);

  const caloriesHit = calories !== '' && caloriesNum <= 2600;
  const proteinHit = protein !== '' && proteinNum >= 220;
  const nutritionComplete = caloriesHit && proteinHit;

  const nutritionPoints = useMemo(() => {
    if (nutritionComplete) return 3;
    if (caloriesHit || proteinHit) return 2;
    if (nutritionTracked || calories !== '' || protein !== '') return 1;
    return 0;
  }, [nutritionComplete, caloriesHit, proteinHit, nutritionTracked, calories, protein]);

  const contentPoints = useMemo(() => {
    let pts = Math.min(videosPosted, 2);
    if (contentCTA && videosPosted > 0) pts += 1;
    if (contentConversation) pts += 1;
    return Math.min(pts, 4);
  }, [videosPosted, contentCTA, contentConversation]);

  const score =
    appointments * 4 +
    (dialing ? 2 : 0) +
    (mediaOutreach ? 3 : 0) +
    contentPoints +
    (fitnessRings ? 3 : 0) +
    nutritionPoints +
    (sleep ? 2 : 0);

  const totalPercent = Math.min((score / SCORE_MAX) * 100, 100);

  const moneyPercent = useMemo(() => {
    if (appointments >= 3) return 100;
    if (appointments >= 2 && mediaOutreach) return 100;

    let pct = Math.min(appointments, 3) * 30;
    if (mediaOutreach) pct += 25;
    if (dialing) pct += 15;

    return Math.min(pct, 100);
  }, [appointments, mediaOutreach, dialing]);

  const contentPercent = Math.min((videosPosted / 2) * 100, 100);

  const ringData = [
    {
      name: 'Money',
      percent: moneyPercent,
      detail: '100% = 3 appts OR 2 appts + outreach',
      complete: moneyPercent >= 100,
    },
    {
      name: 'Content',
      percent: contentPercent,
      detail: '100% = 2 posted videos',
      complete: videosPosted >= 2,
    },
    {
      name: 'Body',
      percent: fitnessRings ? 100 : 0,
      detail: '100% = all Apple Watch rings closed',
      complete: fitnessRings,
    },
    {
      name: 'Nutrition',
      percent: nutritionComplete ? 100 : nutritionPoints === 2 ? 67 : nutritionPoints === 1 ? 34 : 0,
      detail: '100% = ≤2600 cal + 220g protein',
      complete: nutritionComplete,
    },
    {
      name: 'Sleep',
      percent: sleep ? 100 : 0,
      detail: '100% = 6+ quality hours',
      complete: sleep,
    },
  ];

  const missedCategories = ringData.filter((cat) => !cat.complete).length;
  const failedByStrikes = missedCategories >= 2;
  const allRingsClosed = ringData.every((cat) => cat.complete);
  const isPerfectDay = allRingsClosed;

  const status = useMemo(() => {
    if (failedByStrikes) {
      return { label: 'Failed Reroute Day', sub: '2+ major rings missed', icon: AlertTriangle };
    }

    if (score >= 25) {
      return { label: 'Max Win Day', sub: 'Future-you felt that', icon: Trophy };
    }

    if (score >= 20) {
      return { label: 'Strong Win Day', sub: 'This is the standard', icon: Flame };
    }

    if (score >= 15) {
      return { label: 'Minimum Win Day', sub: 'Mission stayed alive', icon: CheckCircle2 };
    }

    return { label: 'Not Enough Yet', sub: 'Under 15 points', icon: AlertTriangle };
  }, [score, failedByStrikes]);

  const isWinDay = score >= 15 && !failedByStrikes;

  const streak = useMemo(() => {
    let count = 0;
    let cursor = todayKey();

    const todaySaved = selectedDate === todayKey() ? { score, failedByStrikes } : history[todayKey()];

    if (todaySaved && (todaySaved.score >= 15 || isWinDay) && !(todaySaved.failedByStrikes || failedByStrikes)) {
      count += 1;
      cursor = getDateOffset(cursor, -1);
    }

    while (history[cursor] && history[cursor].score >= 15 && !history[cursor].failedByStrikes) {
      count += 1;
      cursor = getDateOffset(cursor, -1);
    }

    return count;
  }, [history, score, failedByStrikes, selectedDate, isWinDay]);

  const weeklyStats = useMemo(() => {
    const dates = Array.from({ length: 7 }, (_, i) => getDateOffset(todayKey(), -i));

    const days = dates
      .map((date) => {
        if (date === selectedDate) {
          return {
            score,
            appointments,
            moneyMade: safeNumber(moneyMade),
            videosPosted,
            perfect: isPerfectDay,
            win: isWinDay,
          };
        }

        const d = history[date];

        return d
          ? {
              score: d.score || 0,
              appointments:
                (d.liAppointments || d.appointments || 0) +
                (d.mediaAppointments || 0) +
                (d.fitnessAppointments || 0) +
                (d.otherAppointments || 0),
              moneyMade: safeNumber(d.moneyMade),
              videosPosted: d.videosPosted || 0,
              perfect: d.isPerfectDay || d.allRingsClosed || false,
              win: d.score >= 15 && !d.failedByStrikes,
            }
          : null;
      })
      .filter(Boolean);

    const count = days.length || 1;

    return {
      avgScore: Math.round(days.reduce((sum, d) => sum + d.score, 0) / count),
      totalAppointments: days.reduce((sum, d) => sum + d.appointments, 0),
      totalMoney: days.reduce((sum, d) => sum + d.moneyMade, 0),
      totalVideos: days.reduce((sum, d) => sum + d.videosPosted, 0),
      winDays: days.filter((d) => d.win).length,
      perfectDays: days.filter((d) => d.perfect).length,
    };
  }, [history, selectedDate, score, appointments, moneyMade, videosPosted, isPerfectDay, isWinDay]);

  const twoDayNoPerfectAlert = useMemo(() => {
    const d1 = history[getDateOffset(todayKey(), -1)];
    const d2 = history[getDateOffset(todayKey(), -2)];

    return !!(
      d1 &&
      d2 &&
      !(d1.isPerfectDay || d1.allRingsClosed) &&
      !(d2.isPerfectDay || d2.allRingsClosed)
    );
  }, [history]);

  const StatusIcon = status.icon;

  const saveDay = () => {
    const dayData = {
      liAppointments,
      mediaAppointments,
      fitnessAppointments,
      otherAppointments,
      appointments,
      dialing,
      mediaOutreach,
      videosPosted,
      contentCTA,
      contentConversation,
      fitnessRings,
      calories,
      protein,
      nutritionTracked,
      sleep,
      moneyMade,
      tomorrowMission,
      failedPrompt,
      score,
      totalPercent,
      status: status.label,
      failedByStrikes,
      isPerfectDay,
      allRingsClosed,
      savedAt: new Date().toISOString(),
    };

    const nextHistory = { ...history, [selectedDate]: dayData };
    setHistory(nextHistory);
    localStorage.setItem('ajrJourneyScoreboardHistory', JSON.stringify(nextHistory));
  };

  const analyzeToday = async () => {
    setAiLoading(true);
    setAiError('');
    setAiReview('');

    try {
      const nutritionRing = ringData.find((r) => r.name === 'Nutrition')?.percent || 0;

      const payload = {
        score,
        status: status.label,
        rings: {
          money: Math.round(moneyPercent),
          content: Math.round(contentPercent),
          body: fitnessRings ? 100 : 0,
          nutrition: Math.round(nutritionRing),
          sleep: sleep ? 100 : 0,
        },
        appointments: {
          lifeInsurance: liAppointments,
          media: mediaAppointments,
          fitness: fitnessAppointments,
          other: otherAppointments,
        },
        moneyMade,
        videosPosted,
        calories,
        protein,
        tomorrowMission,
        failedPrompt,
      };

      const response = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || 'AI review failed.');
      }

      setAiReview(result.review || 'No AI review generated.');
    } catch (error) {
      setAiError(error.message || 'Something went wrong.');
    } finally {
      setAiLoading(false);
    }
  };

  const recentDays = Object.entries(history)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);

  const ToggleRow = ({ title, subtitle, points, checked, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-3xl border transition text-left ${
        checked
          ? 'bg-gradient-to-br from-purple-700 to-blue-700 text-white border-purple-400 shadow-lg shadow-purple-950/30'
          : 'bg-slate-950/70 border-slate-800 hover:border-purple-500 text-slate-100'
      }`}
    >
      <div className="flex items-center gap-3">
        {checked ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5 text-slate-500" />}
        <div>
          <span className="font-semibold block">{title}</span>
          {subtitle && <span className="text-xs opacity-75">{subtitle}</span>}
        </div>
      </div>
      <span className="text-sm font-black">+{points}</span>
    </button>
  );

  const ProgressRing = ({ percent, size = 210, stroke = 16, children, gradientId = 'mainGradient' }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (Math.min(percent, 100) / 100) * c;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="55%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#111827" />
            </linearGradient>
          </defs>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="rgba(148,163,184,.18)"
            strokeWidth={stroke}
            fill="none"
          />

          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      </div>
    );
  };

  const MiniRing = ({ cat, idx }) => (
    <div className="rounded-3xl bg-slate-950/80 border border-slate-800 p-4 flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-100 text-sm">{cat.name}</h3>
        <span className="text-xs text-blue-300 font-black">{Math.round(cat.percent)}%</span>
      </div>

      <ProgressRing percent={cat.percent} size={92} stroke={10} gradientId={`miniGradient${idx}`}>
        <span className="text-lg font-black text-white">{Math.round(cat.percent)}</span>
      </ProgressRing>

      <p className="text-[11px] text-slate-400 mt-3 leading-snug">{cat.detail}</p>
    </div>
  );

  const AppointmentCounter = ({ label, value, setValue }) => (
    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
      <p className="text-xs text-slate-400 font-bold mb-2">{label}</p>

      <div className="flex items-center justify-between gap-2">
        <Button className="rounded-xl h-9" variant="outline" onClick={() => setValue(Math.max(0, value - 1))}>
          -
        </Button>

        <div className="text-2xl font-black">{value}</div>

        <Button className="rounded-xl h-9" onClick={() => setValue(value + 1)}>
          +
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#312e81_0,#020617_38%,#000_100%)] text-white p-3 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-5 pb-10">
        <div className="sticky top-0 z-10 -mx-3 px-3 pt-3 pb-4 bg-gradient-to-b from-black/95 to-black/0 backdrop-blur-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-blue-300 font-bold">AJR</p>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight">The Journey Scoreboard</h1>
            </div>

            <Button onClick={saveDay} className="rounded-2xl gap-2 bg-white !text-black hover:bg-blue-100">
              <Save className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>

        {twoDayNoPerfectAlert && (
          <Card className="bg-purple-700/90 border-purple-300">
            <CardContent className="flex gap-3 items-start">
              <BellRing className="h-6 w-6 text-white shrink-0 mt-1" />
              <div>
                <h2 className="font-black text-xl">Notice: 2 Days Without 100%</h2>
                <p className="text-sm text-purple-100 mt-1">
                  You are not off track yet, but comfort is gaining ground. Today needs a full-attack effort.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-purple-950/90 via-slate-950/90 to-blue-950/90 border-purple-900/50">
          <CardContent>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-blue-300 shrink-0 mt-1" />
              <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-100">
                “Every day you waste is a day you choose comfort over being the man you claim to be... Go prove it.”
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center text-center">
            <div className="w-full flex items-center justify-between mb-3 gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <CalendarDays className="h-4 w-4" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <Button onClick={resetInputsOnly} variant="outline" className="rounded-2xl gap-2">
                <RotateCcw className="h-4 w-4" /> Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-4 items-center w-full">
              <div className="hidden sm:block text-left p-4 rounded-3xl bg-black/40 border border-slate-800">
                <div className="flex items-center gap-2 text-blue-300 font-black">
                  <TrendingUp className="h-4 w-4" /> Current Streak
                </div>

                <div className="text-5xl font-black mt-2">{streak}</div>
                <p className="text-xs text-slate-400 mt-1">win day{streak === 1 ? '' : 's'} in a row</p>
              </div>

              <ProgressRing percent={totalPercent} size={230} stroke={18}>
                <div className="flex flex-col items-center justify-center">
                  <div className="text-6xl font-black leading-none">{score}</div>
                  <div className="text-sm text-slate-400 font-bold">/ {SCORE_MAX} pts</div>
                  <div className="text-xs text-blue-300 mt-1 font-black">{Math.round(totalPercent)}%</div>
                </div>
              </ProgressRing>

              <div className="sm:hidden p-4 rounded-3xl bg-black/40 border border-slate-800 mb-2">
                <div className="flex items-center justify-center gap-2 text-blue-300 font-black">
                  <TrendingUp className="h-4 w-4" /> Streak: {streak}
                </div>
              </div>

              <div className="p-4 rounded-3xl bg-black/40 border border-slate-800 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <StatusIcon className="h-5 w-5 text-blue-300" />
                  <h2 className="text-xl font-black">{status.label}</h2>
                </div>

                <p className="text-slate-400 text-sm mt-1">{status.sub}</p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-bold">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-lg font-black text-blue-300">15</div>
                    Min
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-lg font-black text-purple-300">20</div>
                    Strong
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                    <div className="text-lg font-black text-white">25</div>
                    Max
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {ringData.map((cat, idx) => (
            <MiniRing key={cat.name} cat={cat} idx={idx} />
          ))}
        </div>

        <Card>
          <CardContent>
            <h2 className="text-2xl font-black mb-4">Weekly Averages</h2>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              {[
                ['Avg Score', weeklyStats.avgScore],
                ['Appts', weeklyStats.totalAppointments],
                ['Money', `$${weeklyStats.totalMoney}`],
                ['Videos', weeklyStats.totalVideos],
                ['Win Days', weeklyStats.winDays],
                ['100% Days', weeklyStats.perfectDays],
              ].map(([label, val]) => (
                <div key={label} className="p-4 rounded-3xl bg-black/50 border border-slate-800">
                  <p className="text-xs text-slate-400 font-bold">{label}</p>
                  <p className="text-2xl font-black text-blue-300">{val}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-300" />
              <div>
                <h2 className="text-2xl font-black">Daily Actions</h2>
                <p className="text-slate-400 text-sm">Tap fast. Save the day. Build the streak.</p>
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-black/50 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-lg">Appointments Booked</h3>
                  <p className="text-sm text-slate-400">All appointment types are worth +4 each.</p>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-black">{appointments}</p>
                  <p className="text-xs text-blue-300 font-bold">{appointments * 4} pts</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AppointmentCounter label="Life Insurance" value={liAppointments} setValue={setLiAppointments} />
                <AppointmentCounter label="Media" value={mediaAppointments} setValue={setMediaAppointments} />
                <AppointmentCounter label="Fitness" value={fitnessAppointments} setValue={setFitnessAppointments} />
                <AppointmentCounter label="Other" value={otherAppointments} setValue={setOtherAppointments} />
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-black/50 border border-slate-800 space-y-3">
              <h3 className="font-black flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-300" /> Money Made Today
              </h3>

              <input
                value={moneyMade}
                onChange={(e) => setMoneyMade(e.target.value)}
                type="number"
                placeholder="0"
                className="w-full p-4 rounded-2xl border border-slate-700 bg-slate-950 text-white text-2xl font-black"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <ToggleRow
                title="Life insurance dialing block"
                subtitle="4–6 hours of focused work"
                points={2}
                checked={dialing}
                onClick={() => setDialing(!dialing)}
              />

              <ToggleRow
                title="20 media outreaches"
                subtitle="Fitness trainers + realtors"
                points={3}
                checked={mediaOutreach}
                onClick={() => setMediaOutreach(!mediaOutreach)}
              />

              <ToggleRow
                title="All Apple Watch fitness rings closed"
                subtitle="Move, exercise, stand"
                points={3}
                checked={fitnessRings}
                onClick={() => setFitnessRings(!fitnessRings)}
              />

              <ToggleRow
                title="6+ hours quality sleep"
                subtitle="Based on Apple Watch numbers"
                points={2}
                checked={sleep}
                onClick={() => setSleep(!sleep)}
              />
            </div>

            <div className="p-4 rounded-3xl bg-black/50 border border-slate-800 space-y-3">
              <h3 className="font-black">Content</h3>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">Posted videos today</p>
                  <p className="text-xs text-slate-500">2 posted videos = 100% Content ring</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button className="rounded-xl" variant="outline" onClick={() => setVideosPosted(Math.max(0, videosPosted - 1))}>
                    -
                  </Button>

                  <div className="w-10 text-center text-2xl font-black">{videosPosted}</div>

                  <Button className="rounded-xl" onClick={() => setVideosPosted(videosPosted + 1)}>
                    +
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <ToggleRow title="Included clear CTA" points={1} checked={contentCTA} onClick={() => setContentCTA(!contentCTA)} />
                <ToggleRow
                  title="Generated DM/conversation"
                  points={1}
                  checked={contentConversation}
                  onClick={() => setContentConversation(!contentConversation)}
                />
              </div>
            </div>

            <div className="p-4 rounded-3xl bg-black/50 border border-slate-800 space-y-3">
              <h3 className="font-black">Nutrition</h3>

              <p className="text-sm text-slate-400">
                100% = 2600 calories max + 220g protein minimum. Eating out is allowed if it fits the plan.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold">Calories</label>
                  <input
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    type="number"
                    placeholder="2600"
                    className="w-full mt-1 p-4 rounded-2xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-bold">Protein</label>
                  <input
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    type="number"
                    placeholder="220g"
                    className="w-full mt-1 p-4 rounded-2xl border border-slate-700 bg-slate-950 text-white"
                  />
                </div>
              </div>

              <ToggleRow
                title="Nutrition tracked"
                subtitle="Use if you tracked but missed targets"
                points={1}
                checked={nutritionTracked}
                onClick={() => setNutritionTracked(!nutritionTracked)}
              />
            </div>
          </CardContent>
        </Card>

        {(!allRingsClosed || failedByStrikes) && (
          <Card className="border-purple-900/60">
            <CardContent className="space-y-3">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-purple-300" /> Failed/Incomplete Day Prompt
              </h2>

              <p className="text-sm text-slate-400">If you did not close all 5 rings, write the truth. No drama. Just data.</p>

              <textarea
                value={failedPrompt}
                onChange={(e) => setFailedPrompt(e.target.value)}
                placeholder="Today missed 100% because one or more rings stayed open..."
                className="w-full min-h-28 p-4 rounded-2xl border border-slate-700 bg-slate-950 text-white"
              />
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-blue-950 via-slate-950 to-purple-950 border-blue-900/60">
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-300" /> AI Daily Coach
                </h2>

                <p className="text-sm text-slate-400">
                  Get a no-BS review based on today’s score, rings, money, content, nutrition, and recovery.
                </p>
              </div>

              <Button
                onClick={analyzeToday}
                disabled={aiLoading}
                className="rounded-2xl bg-white !text-black hover:bg-blue-100"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing
                  </>
                ) : (
                  'Analyze Today'
                )}
              </Button>
            </div>

            {aiError && (
              <div className="p-4 rounded-2xl bg-red-950/70 border border-red-800 text-red-200 text-sm">
                {aiError}
              </div>
            )}

            {aiReview && (
              <div className="p-4 rounded-2xl bg-black/50 border border-slate-800 text-slate-100 whitespace-pre-line leading-relaxed text-sm">
                {aiReview}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-blue-300" /> Tomorrow’s Mission
            </h2>

            <textarea
              value={tomorrowMission}
              onChange={(e) => setTomorrowMission(e.target.value)}
              placeholder="Tomorrow’s top 3 targets..."
              className="w-full min-h-28 p-4 rounded-2xl border border-slate-700 bg-slate-950 text-white"
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">2-Strike Rule</h2>
                <p className="text-slate-400 text-sm">Miss 2+ rings and the day fails, even if you were busy.</p>
              </div>

              <div
                className={`px-4 py-2 rounded-2xl font-black text-sm ${
                  failedByStrikes ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800 text-blue-300'
                }`}
              >
                {missedCategories} missed
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950 via-slate-950 to-blue-950">
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-blue-300" />
              <h2 className="text-2xl font-black">Reroute Statement</h2>
            </div>

            <p className="text-slate-200 leading-relaxed text-sm">
              I am in survival mode, but not panic mode. Every day I must create money opportunity, train my body,
              document proof, control my inputs, and protect tomorrow. If I score under 15, I did not do enough. If I
              hit 20, I am becoming dangerous. If I hit 25, I am becoming the man I said I would be.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-2xl font-black mb-3">Recent Saves</h2>

            {recentDays.length === 0 ? (
              <p className="text-slate-400 text-sm">No saved days yet. Hit Save after you update the scoreboard.</p>
            ) : (
              <div className="space-y-2">
                {recentDays.map(([date, day]) => (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="w-full p-3 rounded-2xl bg-black/50 border border-slate-800 flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="font-bold">{date}</div>
                      <div className="text-xs text-slate-400">{day.status}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-blue-300">{day.score}</div>
                      <div className="text-xs text-slate-500">${safeNumber(day.moneyMade)}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
