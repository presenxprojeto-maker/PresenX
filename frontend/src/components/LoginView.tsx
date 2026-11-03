import { useState, type FormEvent } from 'react';
import { Fingerprint, LoaderCircle, LockKeyhole } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginViewProps {
  message?: string;
  onSignedIn: () => void;
}

export function LoginView({ message, onSignedIn }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);
    if (signInError) {
      const message = signInError.message.toLowerCase();
      if (signInError.code === 'invalid_credentials') {
        setError('E-mail ou senha incorretos.');
      } else if (signInError.code === 'email_not_confirmed') {
        setError('Confirme o e-mail da conta no Supabase antes de entrar.');
      } else if (message.includes('fetch') || message.includes('network')) {
        setError('Não foi possível conectar ao Supabase. Confira a URL do projeto e sua conexão com a internet.');
      } else if (message.includes('api key')) {
        setError('A chave publicável do Supabase não foi aceita. Confira VITE_SUPABASE_ANON_KEY no .env.local.');
      } else {
        setError('Não foi possível entrar. Confira os dados da conta e tente novamente.');
      }
      return;
    }
    onSignedIn();
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: 'var(--bg-main)' }}>
      <section className="panel" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '26px' }}>
          <div className="login-brand-mark">
            <Fingerprint size={23} color="#fff" />
          </div>
          <div>
            <h1 className="login-brand-title" style={{ margin: 0, color: 'var(--text-main)' }}>PresenX 2.0</h1>
            <p style={{ margin: '3px 0 0', color: 'var(--text-sub)', fontSize: '0.78rem' }}>Acesso à área administrativa</p>
          </div>
        </div>

        {message && <p role="status" style={{ color: 'var(--amber)', fontSize: '0.82rem', lineHeight: 1.5 }}>{message}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            E-mail
            <input autoComplete="username" required type="email" className="input-field" style={{ marginTop: '6px' }} value={email} onChange={event => setEmail(event.target.value)} />
          </label>
          <label style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
            Senha
            <input autoComplete="current-password" required type="password" className="input-field" style={{ marginTop: '6px' }} value={password} onChange={event => setPassword(event.target.value)} />
          </label>
          {error && <p role="alert" style={{ color: 'var(--rose)', fontSize: '0.78rem', margin: 0 }}>{error}</p>}
          <button type="submit" className="btn-solid" disabled={isSubmitting} style={{ justifyContent: 'center', marginTop: '4px', opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? <LoaderCircle size={15} className="spin" /> : <LockKeyhole size={15} />}
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p style={{ margin: '18px 0 0', color: 'var(--text-sub)', fontSize: '0.72rem', lineHeight: 1.5 }}>
          As contas administrativas são criadas e autorizadas no projeto Supabase. O PresenX não permite cadastro público.
        </p>
      </section>
    </main>
  );
}
