import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

import FormField from './FormField.jsx';

function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <FormField {...props} icon={Lock} type={visible ? 'text' : 'password'} />
      <button
        className="absolute right-3 top-[34px] rounded-md p-1 text-muted transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
        type="button"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
      </button>
    </div>
  );
}

export default PasswordField;
