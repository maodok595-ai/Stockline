import { useState } from 'react';
import { CompanyCard } from '../CompanyCard';

export default function CompanyCardExample() {
  const [isActive, setIsActive] = useState(true);
  
  return (
    <div className="p-6 bg-background max-w-md">
      <CompanyCard
        id="1"
        name="Diallo Distribution"
        email="contact@diallodist.sn"
        phone="+221 77 123 45 67"
        logo="DD"
        usersCount={8}
        productsCount={1248}
        isActive={isActive}
        onToggleStatus={() => setIsActive(!isActive)}
        onEdit={() => console.log('Edit')}
        onDelete={() => console.log('Delete')}
        onResetPassword={() => console.log('Reset password')}
      />
    </div>
  );
}
