import { useEffect, useRef, useState } from 'react';

interface SplashScreenProps {
  isReady: boolean;
}

export function SplashScreen({ isReady }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const startedAt = useRef(performance.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - startedAt.current;
      if (isReady && elapsed >= 1600) {
        setProgress(100);
        window.clearInterval(interval);
        return;
      }
      setProgress(Math.min(90, Math.round((elapsed / 1600) * 90)));
    }, 24);

    return () => window.clearInterval(interval);
  }, [isReady]);

  return (
    <main className="splash-screen" aria-label="Carregando PresenX">
      <header className="splash-topbar">
        <div className="splash-brand">
          <span className="splash-mark" aria-hidden="true">PX</span>
          <span>PresenX</span>
        </div>
      </header>

      <section className="splash-hero">
        <div className="splash-copy">
          <span className="splash-caption">LEITURA RFID</span>
          <h1>O leitor identifica. <em>O PresenX registra.</em></h1>
          <p>Entradas, saídas e tentativas negadas ficam ligadas à pessoa, ao ponto de controle e ao horário.</p>

          <div className="splash-loader">
            <div className="splash-loader-label">
              <span>{progress === 100 ? 'Acesso conferido' : 'Conferindo o acesso'}</span>
              <span>{progress}%</span>
            </div>
            <div
              className="splash-track"
              role="progressbar"
              aria-label="Carregamento do PresenX"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <span className="splash-progress" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="splash-art" aria-label="Ilustração do fluxo de leitura de cartão RFID">
          <div className="splash-art-meta"><span>IDENTIFICAÇÃO</span><span>EVENTO DE ACESSO</span></div>
          <svg className="splash-illustration" viewBox="0 0 620 500" fill="none" role="img" aria-label="Cartão RFID aproximado de um leitor de acesso">
            <path className="splash-plan-line" d="M34 95H170V37H510V95H586M34 410H155V462H472V410H586M78 95V410M542 95V410" />
            <path className="splash-plan-line splash-plan-line-dashed" d="M34 252H204M416 252H586M310 37V113M310 388V462" />
            <rect x="243" y="91" width="134" height="302" rx="19" fill="#f8fbfd" stroke="#d7e4ed" strokeWidth="2" />
            <rect x="258" y="108" width="104" height="45" rx="5" fill="#e7f0f6" />
            <path d="M274 127H346" stroke="#195b91" strokeWidth="2" strokeLinecap="round" />
            <circle cx="310" cy="255" r="62" stroke="#8bb3cf" strokeWidth="2" />
            <circle cx="310" cy="255" r="42" stroke="#276da6" strokeWidth="2" />
            <circle cx="310" cy="255" r="14" fill="#276da6" />
            <path d="M399 215C423 236 423 274 399 295M420 195C456 229 456 281 420 315" stroke="#276da6" strokeWidth="3" strokeLinecap="round" />
            <path d="M219 255H195V205H89V294H195V255" stroke="#8bb3cf" strokeWidth="2" strokeDasharray="5 7" />
            <g className="splash-card">
              <rect x="70" y="184" width="124" height="86" rx="8" fill="white" stroke="#276da6" strokeWidth="2" />
              <rect x="84" y="198" width="26" height="21" rx="3" fill="#e7f0f6" stroke="#8bb3cf" strokeWidth="2" />
              <path d="M119 201H177M119 210H167M84 237H178" stroke="#8bb3cf" strokeWidth="2" strokeLinecap="round" />
            </g>
            <circle className="splash-signal-dot" cx="310" cy="255" r="6" fill="#138078" />
            <rect x="395" y="350" width="151" height="54" rx="5" fill="white" stroke="#d7e4ed" />
            <circle cx="416" cy="377" r="5" fill="#138078" />
            <path d="M431 371H523M431 382H499" stroke="#8098a8" strokeWidth="2" strokeLinecap="round" />
            <path d="M117 130V109M105 130H129M478 126V105M466 126H490M117 375V354M105 375H129M478 375V354M466 375H490" stroke="#8bb3cf" strokeWidth="2" />
          </svg>
          <div className="splash-art-legend"><span>PONTO DE CONTROLE</span><span className="splash-live"><i aria-hidden="true" /> REGISTRO CRIADO</span></div>
        </div>
      </section>
    </main>
  );
}
