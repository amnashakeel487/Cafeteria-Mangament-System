import abdullahImg from '../assets/abdullah_avatar.png';

const teamMembers = [
  {
    name: 'Muhammad Abdullah',
    role: 'Team Leader',
    description: 'Full-stack developer specializing in modern web technologies and scalable systems architecture.',
    image: abdullahImg,
    isLeader: true,
  },
  {
    name: 'Muhammad Waqar Anjum',
    role: 'Developer',
    description: 'Creative developer with expertise in UI/UX design and frontend technologies.',
    initials: 'WA',
    isLeader: false,
  },
];

export default function DevelopmentTeam() {
  return (
    <section className="mt-16 mb-4">
      {/* Section Header */}
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-2 bg-primary-container/20 text-primary border border-primary/20 px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <span className="material-symbols-outlined text-sm">code</span>
          Meet The Developers
        </span>
        <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface mt-3" style={{ fontFamily: 'Manrope' }}>
          Development Team
        </h2>
        <p className="text-on-surface-variant text-sm mt-2 max-w-md mx-auto">
          The talented minds behind this FYP Portal
        </p>
      </div>

      {/* Team Leader — Top Center */}
      <div className="flex justify-center mb-8">
        <TeamCard member={teamMembers[0]} />
      </div>

      {/* Team Members — Bottom Row */}
      <div className="flex justify-center gap-6 flex-wrap">
        {teamMembers.slice(1).map((member, i) => (
          <TeamCard key={i} member={member} />
        ))}
      </div>
    </section>
  );
}

function TeamCard({ member }) {
  return (
    <div className="group relative w-full max-w-xs">
      {/* Glow border effect */}
      <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-primary/60 via-primary-container/40 to-primary/60 opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-[1px]"></div>

      <div className="relative bg-surface-container-high rounded-2xl p-8 flex flex-col items-center text-center overflow-hidden transition-all duration-300 group-hover:bg-surface-container-highest">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none"></div>

        {/* Avatar */}
        <div className="relative z-10 mb-5">
          <div className="relative">
            {/* Ring */}
            <div className={`w-28 h-28 rounded-full p-[3px] ${
              member.isLeader
                ? 'bg-gradient-to-br from-primary via-primary-container to-primary'
                : 'bg-gradient-to-br from-tertiary via-tertiary-container to-tertiary'
            }`}>
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover border-2 border-surface-container-high"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary-container/30 border-2 border-surface-container-high flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-primary/70" style={{ fontFamily: 'Manrope' }}>
                    {member.initials}
                  </span>
                </div>
              )}
            </div>

            {/* Badge icon */}
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
              member.isLeader
                ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]'
                : 'bg-gradient-to-br from-tertiary to-tertiary-container'
            }`}>
              <span className="material-symbols-outlined text-sm text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                {member.isLeader ? 'workspace_premium' : 'star'}
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="relative z-10 space-y-3">
          <h3 className="text-lg font-extrabold text-on-surface" style={{ fontFamily: 'Manrope' }}>
            {member.name}
          </h3>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            member.isLeader
              ? 'bg-primary-container/20 text-primary border border-primary/20'
              : 'bg-tertiary/10 text-tertiary border border-tertiary/20'
          }`}>
            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {member.isLeader ? 'shield' : 'code'}
            </span>
            {member.role}
          </span>

          <p className="text-on-surface-variant text-xs leading-relaxed max-w-[240px]">
            {member.description}
          </p>
        </div>
      </div>
    </div>
  );
}
