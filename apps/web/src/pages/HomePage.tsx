import { Link } from 'react-router-dom';
import { Thermometer, Palette, ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          Skapa vackra virkningsmönster
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-4">
          Välkommen till <span className="text-primary-600">Garnmönster</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Skapa unika virkningsmönster baserade på temperaturdata.
          Varje rad representerar en dags temperatur med din valda färgskala.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <FeatureCard
          to="/temperatur"
          icon={<Thermometer className="w-8 h-8" />}
          title="Temperaturmönster"
          description="Skapa ett mönster baserat på verkliga temperaturdata från SMHI. Välj plats, datumintervall och färgskala."
          color="primary"
        />
        <FeatureCard
          to="/garnbibliotek"
          icon={<Palette className="w-8 h-8" />}
          title="Garnbibliotek"
          description="Bläddra bland färdiga färgpaletter eller skapa egna från dina favoritgarner."
          color="pink"
        />
      </div>

      <div className="card animate-slide-up">
        <h2 className="text-xl font-display font-semibold text-gray-800 mb-4">
          Vad är en temperaturfilt?
        </h2>
        <div className="prose prose-pink max-w-none text-gray-600">
          <p>
            En temperaturfilt (eller temperature blanket) är ett populärt virknings- eller stickprojekt
            där du skapar en rad per dag under ett helt år. Varje rads färg bestäms av dagens temperatur
            enligt en färgskala du väljer själv.
          </p>
          <p className="mt-4">
            Resultatet blir en vacker visuell representation av ett års väder - från vinterkyla
            i blått till sommarens varma röda och orange nyanser.
          </p>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 via-green-400 via-yellow-400 to-red-500 rounded-lg h-16 shadow-inner">
          <div className="h-full flex items-center justify-center text-white text-sm font-medium drop-shadow">
            Exempelfärgskala: -20°C → +35°C
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'primary' | 'pink';
}

function FeatureCard({ to, icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    primary: 'bg-primary-500 group-hover:bg-primary-600',
    pink: 'bg-pink-500 group-hover:bg-pink-600'
  };

  return (
    <Link
      to={to}
      className="group card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`w-16 h-16 ${colorClasses[color]} rounded-2xl flex items-center justify-center text-white mb-4 transition-colors`}>
        {icon}
      </div>
      <h3 className="text-xl font-display font-semibold text-gray-800 mb-2 flex items-center gap-2">
        {title}
        <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
      </h3>
      <p className="text-gray-600">{description}</p>
    </Link>
  );
}
