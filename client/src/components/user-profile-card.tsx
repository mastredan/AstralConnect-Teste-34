import { User } from "lucide-react";
import { GlassCard } from "./glass-card";

interface UserProfileCardProps {
  user: any;
}

export function UserProfileCard({ user }: UserProfileCardProps) {
  if (!user) return null;

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email?.split('@')[0] || 'Usuário';

  const zodiacSign = user.astrologicalProfile?.zodiacSign || "♎ Libra";

  return (
    <GlassCard className="p-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[hsl(258,84%,60%)] to-[hsl(214,84%,56%)] flex items-center justify-center mx-auto mb-4">
          {user.profileImageUrl ? (
            <img 
              src={user.profileImageUrl} 
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="text-white" size={32} />
          )}
        </div>
        <h3 className="text-white font-semibold mb-1">{displayName}</h3>
        <p className="text-[hsl(220,13%,91%)] text-sm mb-2">{zodiacSign}</p>
        <div className="flex justify-center space-x-4 text-sm">
          <div className="text-center">
            <div className="text-white font-semibold">{user.stats?.followers || 0}</div>
            <div className="text-[hsl(220,13%,91%)]">Seguidores</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{user.stats?.following || 0}</div>
            <div className="text-[hsl(220,13%,91%)]">Seguindo</div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
