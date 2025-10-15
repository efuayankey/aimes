import React, { useState } from 'react';
import { Brain, Play, Globe, Heart, ChevronLeft, Home, LogOut, Sparkles, Sun, Moon, Leaf, Star } from 'lucide-react';

interface Video {
  id: string;
  title: string;
}

interface CategoryData {
  title: string;
  icon: React.ReactNode;
  gradient: string;
  videos: Video[];
}

interface VideoData {
  [key: string]: CategoryData;
}

const videoData: VideoData = {
  'english-singaporean': {
    title: 'English Language – Singaporean Speaker',
    icon: <Globe className="w-6 h-6" />,
    gradient: 'from-emerald-400 to-teal-600',
    videos: [
      { id: 'aWPCJ_hOlXk', title: '10-min Body Scan (Lying Down) Mindfulness Practice | Angie Chew' },
      { id: 'l2oBTzFvq1k', title: '30-min Body Scan (Lying Down) | Angie Chew' },
      { id: 'QH2pzjpeOu8', title: '10-min Body Scan (Seated) Mindfulness Practice | Angie Chew' },
      { id: 'ayQvwWToQ4w', title: 'Loving-Kindness Mindfulness Practice | Angie Chew' },
      { id: '81pJQFBlSms', title: '30-min Breath Awareness Mindfulness Practice | Angie Chew' }
    ]
  },
  
  'english-indian-american': {
    title: 'English Language – Indian-American Speaker',
    icon: <Sun className="w-6 h-6" />,
    gradient: 'from-orange-400 to-red-500',
    videos: [
      { id: 'PsKEgrx0Xwc', title: 'Isha Kriya: A Guided Meditation For Health And Wellbeing' },
      { id: 'f_fOsZxXcXE', title: 'Deepak Chopra: Journey to Perfect Health: A Guided Meditation' },
      { id: 'zLJu3wQA1Ko', title: 'Yoga Nidra - Guided Meditation for Sleep & Relaxation by Gurudev | Non-Sleep Deep Rest (NSDR)' },
      { id: 'fgChzlOt3XI', title: 'Guided MEDITATION To Reconnect & Recharge (English): BK Shivani' },
      { id: 'PttMV1xRJv4', title: '10 Minute Guided Mindfulness Meditation | Sit By the Lake With Gurudev Sri Sri Ravi Shankar' }
    ]
  },
  'english-african-american': {
    title: 'English Language – African-American Speaker',
    icon: <Heart className="w-6 h-6" />,
    gradient: 'from-purple-400 to-pink-600',
    videos: [
      { id: 'VyOF4t770H8', title: '10 Min Breathwork & Light Meditation for Focus (Beginner Friendly!)' },
      { id: '-MryFjZoEr0', title: 'Mindfulness Meditation - Guided 10 Minutes' },
      { id: 'plywX6ShI98', title: 'Daily Calm | 10 Minute Mindfulness Meditation | Be Present' },
      { id: '195zAbeTCis', title: '10 Minute Guided Mindfulness Meditation ( African American )' },
      { id: 'mN-4Cu_HSZw', title: 'Mindfulness for Overthinking Guided Meditation' },
      { id: 'z-T5oYqiut4', title: '10-Minute Daily Meditation For Stress Relief: Easy Mindfulness for Beginners' },
      { id: 'AEwhHU_jCnw', title: '10 Minute Guided Mindfulness Meditation' }
    ]
  },
  'spanish-latin-american': {
    title: 'Spanish Language – Latin American Speaker',
    icon: <Sun className="w-6 h-6" />,
    gradient: 'from-yellow-400 to-orange-500',
    videos: [
      { id: 'ue9fs4ticOo', title: 'Spanish - Guided Relaxation Meditation | Meditación guiada' },
      { id: '9jY0r1JWULQ', title: 'Meditación guiada LUZ BLANCA de AMOR y SANACIÓN @GabrielaLitschi' },
      { id: 'L9Fq0jZFCI0', title: '🎧PAZ Y CALMA INTERIOR/ Mindfulness en español/ Mindful Science/Meditación Guiada' },
      { id: 'YhIOAewA-i4', title: '🧘‍♀Meditación Guiada de Mindfulness🧘Escaneo Corporal en 15 Minutos para Calmar tu Mente y Cuerpo' },
      { id: 'zJcYuFHJwkQ', title: 'Colombian Spanish - Guided Relaxation Meditation | Meditación guiada' }
    ]
  },
  'english-british': {
    title: 'English Language – British English Speaker',
    icon: <Leaf className="w-6 h-6" />,
    gradient: 'from-green-400 to-emerald-600',
    videos: [
      { id: 'Jyy0ra2WcQQ', title: 'Guided Meditation - Blissful Deep Relaxation' },
      { id: '0DXiDp0tPWY', title: 'Settle Anxious Thoughts in 9 Minutes. GUIDED MEDITATION' },
      { id: 'jobVHhlMmRo', title: 'Mindfulness Meditation - Guided 20 Minutes' },
      { id: '6p_yaNFSYao', title: 'Mindfulness Meditation - Guided 10 Minutes' },
      { id: '36AiNPNCHF8', title: 'Guided Meditation for Inner Strength and Confidence' }
    ]
  },
  'mandarin-chinese': {
    title: 'Mandarin Chinese Language – Mandarin Chinese Speaker',
    icon: <Moon className="w-6 h-6" />,
    gradient: 'from-red-400 to-pink-500',
    videos: [
      { id: 'FgHBS5FR4po', title: '正念冥想 | 20分鐘引導冥想專注當下減壓靜心 Mindfulness Meditation Guided in Chinese' },
      { id: '69zSMzmK2Is', title: '身体扫描正念练习 Body Scan Mindfulness Practice' },
      { id: 'M0bFkr14w9I', title: '引導冥想 | 20分鐘緩解焦慮減壓正念回歸平靜 Chinese Guided Meditation to Reduce Stress and Anxiety' },
      { id: '3p3hCqGR7YM', title: 'Guided Morning Mindfulness Meditation for Letting Go' },
      { id: 'XvUJl71hHhM', title: '正念呼吸引導練習—陳德中老師' },
      { id: 'rrZV55JjIcg', title: 'Mindful Meditation in Mandarin Chinese 壓力正念冥想' }
    ]
  },
  'english-anglo-american': {
    title: 'English Language – Anglo-American Speaker',
    icon: <Star className="w-6 h-6" />,
    gradient: 'from-blue-400 to-indigo-600',
    videos: [
      { id: 'nmL-svyPHPU', title: 'Guided Mindfulness Meditation on Loving Your Life: Finding Joy & Peace in Every Moment' },
      { id: 'ssss7V1_eyA', title: '5 Minute Guided Meditation' },
      { id: '6p_yaNFSYao', title: 'Mindfulness Meditation - Guided 10 Minutes' },
      { id: 'ZToicYcHIOU', title: 'Daily Calm | 10 Minute Mindfulness Meditation | Be Present' },
      { id: 'caq8XpjAswo', title: 'Guided Mindfulness Meditation to Relax and be Calm' }
    ]
  }
};

const CategoryCard: React.FC<{ categoryKey: string; data: CategoryData; onClick: () => void }> = ({ 
  categoryKey, 
  data, 
  onClick 
}) => (
  <div 
    className="group relative overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105"
    onClick={onClick}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${data.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
    
    <div className="relative p-8">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-full bg-gradient-to-br ${data.gradient} text-white shadow-lg`}>
          {data.icon}
        </div>
        <div className="text-2xl opacity-20 group-hover:opacity-30 transition-opacity">
          🧘‍♀️
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-gray-900 transition-colors">
        {data.title}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        {data.videos.length} guided meditation videos
      </p>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 font-medium">
          CLICK TO EXPLORE
        </span>
        <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  </div>
);

const VideoCard: React.FC<{ video: Video }> = ({ video }) => (
  <div className="bg-white backdrop-blur-sm rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="aspect-video">
      <iframe
        src={`https://www.youtube.com/embed/${video.id}`}
        title={video.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
    <div className="p-4">
      <h4 className="font-semibold text-gray-800 text-sm leading-tight">
        {video.title}
      </h4>
    </div>
  </div>
);

const MindfulnessLibrary: React.FC = () => {
  const [currentView, setCurrentView] = useState<'categories' | 'videos'>('categories');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const CategoriesView = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80')`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full text-white shadow-lg">
                <Leaf className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Mindfulness Video Library
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover guided meditation and mindfulness practices from diverse cultural perspectives. 
              Choose your preferred language and cultural context for a personalized experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(videoData).map(([key, data]) => (
              <CategoryCard 
                key={key} 
                categoryKey={key} 
                data={data} 
                onClick={() => {
                  setSelectedCategory(key);
                  setCurrentView('videos');
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const VideosView = () => {
    const categoryData = selectedCategory ? videoData[selectedCategory] : null;
    
    if (!categoryData) return null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80')`,
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
              <button
                onClick={() => setCurrentView('categories')}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mb-6"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back to Categories
              </button>
              
              <div className="flex items-center mb-6">
                <div className={`p-3 rounded-full bg-gradient-to-br ${categoryData.gradient} text-white shadow-lg mr-4`}>
                  {categoryData.icon}
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {categoryData.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {categoryData.videos.length} guided meditation videos
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryData.videos.map((video, index) => (
                <VideoCard key={index} video={video} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {currentView === 'categories' ? <CategoriesView /> : <VideosView />}
    </div>
  );
};

export default MindfulnessLibrary;