'use client';

import { useState } from 'react';
import { Demographics } from '@/lib/types';
import { saveDemographics } from '@/lib/store';
import { REGIONS } from '@/lib/data';
import { UserCircle2, MapPin, Calendar } from 'lucide-react';

interface DemographicsModalProps {
  onComplete: (data: Demographics) => void;
  onSkip: () => void;
}

export default function DemographicsModal({ onComplete, onSkip }: DemographicsModalProps) {
  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<Demographics['gender'] | ''>('');
  const [ageGroup, setAgeGroup] = useState<Demographics['ageGroup'] | ''>('');
  const [region, setRegion] = useState('');

  const genderOptions = [
    { value: 'male', label: '남성', emoji: '👨' },
    { value: 'female', label: '여성', emoji: '👩' },
    { value: 'other', label: '기타', emoji: '🧑' },
  ];

  const ageOptions = [
    { value: '10s', label: '10대', emoji: '🧒' },
    { value: '20s', label: '20대', emoji: '🧑' },
    { value: '30s', label: '30대', emoji: '💼' },
    { value: '40s', label: '40대', emoji: '👔' },
    { value: '50s', label: '50대', emoji: '🎩' },
    { value: '60s+', label: '60대 이상', emoji: '👴' },
  ];

  const handleSubmit = () => {
    if (!gender || !ageGroup || !region) return;
    const data: Demographics = {
      gender: gender as Demographics['gender'],
      ageGroup: ageGroup as Demographics['ageGroup'],
      region,
    };
    saveDemographics(data);
    onComplete(data);
  };

  const steps = [
    {
      icon: <UserCircle2 size={28} className="text-primary" />,
      title: '성별을 선택해 주세요',
      subtitle: '통계에 반영됩니다',
      content: (
        <div className="grid grid-cols-3 gap-3">
          {genderOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setGender(opt.value as Demographics['gender']);
                setTimeout(() => setStep(1), 200);
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                gender === opt.value
                  ? 'border-primary bg-primary-light'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-3xl">{opt.emoji}</span>
              <span className="text-sm font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <Calendar size={28} className="text-secondary" />,
      title: '연령대를 선택해 주세요',
      subtitle: '통계에 반영됩니다',
      content: (
        <div className="grid grid-cols-3 gap-3">
          {ageOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setAgeGroup(opt.value as Demographics['ageGroup']);
                setTimeout(() => setStep(2), 200);
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                ageGroup === opt.value
                  ? 'border-primary bg-primary-light'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="text-sm font-semibold">{opt.label}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      icon: <MapPin size={28} className="text-accent" />,
      title: '지역을 선택해 주세요',
      subtitle: '통계에 반영됩니다',
      content: (
        <div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
            {REGIONS.map((r) => (
              <button
                key={r}
                onClick={() => setRegion(r)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all duration-200 hover:scale-105 ${
                  region === r
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          {region && (
            <button
              onClick={handleSubmit}
              className="w-full mt-4 btn btn-primary text-base py-3"
            >
              완료! 투표하러 가기 🎉
            </button>
          )}
        </div>
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="animate-fade-in">
      {/* Progress */}
      <div className="flex gap-2 mb-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= step ? 'gradient-primary' : 'bg-border'
            }`}
          />
        ))}
      </div>

      {/* Step Content */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-hover mb-3">
          {currentStep.icon}
        </div>
        <h3 className="text-xl font-bold text-text-primary">{currentStep.title}</h3>
        <p className="text-sm text-text-muted mt-1">{currentStep.subtitle}</p>
      </div>

      <div className="animate-fade-in" key={step}>
        {currentStep.content}
      </div>

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="text-sm text-text-muted hover:text-text-primary transition-colors"
          >
            ← 이전
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={onSkip}
          className="text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          다음에 하기
        </button>
      </div>
    </div>
  );
}
