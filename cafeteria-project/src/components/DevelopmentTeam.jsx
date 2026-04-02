import { motion } from 'framer-motion';
import abdullahImg from '../assets/abdullah_avatar.png';
import amnaImg from '../assets/amna_avatar.png';
import maidaImg from '../assets/maida_avatar.jpeg';

const teamMembers = [
  {
    name: 'Muhammad Abdullah',
    role: 'Team Leader',
    description: 'Full-stack developer specializing in modern web technologies and scalable systems.',
    image: abdullahImg,
    isLeader: true,
    portfolioUrl: 'https://muhammadabdullahcv.vercel.app/',
  },
  {
    name: 'Amna Shakeel',
    role: 'Full Stack Developer',
    description: 'Expertise in modern web technologies, delivering user-friendly applications.',
    image: amnaImg,
    isLeader: false,
    portfolioUrl: 'https://my-portfolio-puce-rho-26.vercel.app/',
  },
  {
    name: 'Maida Amjad',
    role: 'AI Engineer',
    description: 'Focus on making real world AI Applications and Training Models.',
    image: maidaImg,
    isLeader: false,
    portfolioUrl: 'https://my-portfolio-iota-two-82.vercel.app/',
  },
];

export default function DevelopmentTeam({ loginSlot }) {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={loginSlot ? 'w-full px-4 py-8' : 'mt-20 mb-10 px-4'}
    >
      {/* Outer Card Wrapper */}
      <div className="max-w-6xl mx-auto bg-surface-container-low/40 backdrop-blur-md rounded-[2.5rem] border border-white/5 p-8 md:p-14 shadow-2xl relative overflow-hidden group/outer">
        {/* Abstract Background Glows */}
        <div className="absolute top-0 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 -left-20 w-96 h-96 bg-tertiary/10 rounded-full blur-[100px] pointer-events-none"></div>

        {loginSlot ? (
          /* ── Login page layout: team left, login right ── */
          <div className="relative z-10 flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
            {/* Left: team info */}
            <div className="flex-1 min-w-0">
              <div className="mb-10">
                <motion.span
                  initial={{ scale: 0.9 }}
                  whileInView={{ scale: 1 }}
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-5"
                >
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  Engineering Excellence
                </motion.span>
                <h2 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight" style={{ fontFamily: 'Manrope' }}>
                  Meet The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Architects</span>
                </h2>
                <p className="text-on-surface-variant text-sm mt-3 max-w-sm font-medium">
                  The visionary engineering team behind the COMSTAS Cafeteria ecosystem.
                </p>
              </div>

              {/* Team leader centered on top */}
              <div className="flex justify-center mb-4">
                <div className="w-full max-w-[180px]">
                  <TeamCard member={teamMembers[0]} index={0} compact />
                </div>
              </div>
              {/* Other two below in 2 columns */}
              <div className="grid grid-cols-2 gap-4">
                {teamMembers.slice(1).map((member, i) => (
                  <TeamCard key={i} member={member} index={i + 1} compact />
                ))}
              </div>
            </div>

            {/* Right: login form */}
            <div className="w-full lg:w-[420px] shrink-0 self-stretch">
              <div className="h-full">
                {loginSlot}
              </div>
            </div>
          </div>
        ) : (
          /* ── Dashboard layout: centered ── */
          <>
            <div className="text-center mb-16 relative z-10">
              <motion.span 
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6"
              >
                <span className="material-symbols-outlined text-[14px]">bolt</span>
                Engineering Excellence
              </motion.span>
              <h2 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight" style={{ fontFamily: 'Manrope' }}>
                Meet The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Architects</span>
              </h2>
              <p className="text-on-surface-variant text-base mt-4 max-w-xl mx-auto font-medium">
                The visionary engineering team behind the COMSTAS Cafeteria ecosystem.
              </p>
            </div>

            <div className="relative z-10">
              <div className="flex justify-center mb-12">
                <TeamCard member={teamMembers[0]} index={0} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {teamMembers.slice(1).map((member, i) => (
                  <TeamCard key={i} member={member} index={i + 1} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.section>
  );
}

function TeamCard({ member, index, compact }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: compact ? -4 : -8 }}
      className={`group relative flex ${compact ? 'flex-col items-center text-center p-4' : 'flex-col items-center p-6'} rounded-3xl bg-surface-container-high/60 border border-white/5 backdrop-blur-sm shadow-xl transition-all duration-500 hover:bg-surface-container-highest w-full`}
    >
      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 pointer-events-none ${member.isLeader ? 'bg-primary' : 'bg-tertiary'}`}></div>

      {/* Profile Image */}
      <div className={`relative shrink-0 ${compact ? 'mb-3' : 'mb-6'}`}>
        <div className={`rounded-full p-1 shadow-2xl transition-transform duration-500 group-hover:scale-105 ${compact ? 'w-14 h-14' : 'w-28 h-28 md:w-32 md:h-32'} ${
          member.isLeader 
            ? 'bg-gradient-to-tr from-primary via-primary-container to-primary' 
            : 'bg-gradient-to-tr from-tertiary via-tertiary-container to-tertiary'
        }`}>
          <img src={member.image} alt={member.name} className="w-full h-full rounded-full object-cover object-top border-4 border-surface-container-high" />
        </div>
        <div className={`absolute -bottom-1 -right-1 rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 transition-transform group-hover:rotate-0 duration-300 ${compact ? 'w-6 h-6' : 'w-10 h-10'} ${member.isLeader ? 'bg-primary text-on-primary' : 'bg-tertiary text-on-tertiary'}`}>
          <span className="material-symbols-outlined" style={{ fontSize: compact ? '12px' : '20px', fontVariationSettings: "'FILL' 1" }}>
            {member.isLeader ? 'military_tech' : 'verified'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className={compact ? 'w-full' : 'text-center space-y-4'}>
        <div>
          <h3 className={`font-black text-on-surface tracking-tight ${compact ? 'text-sm' : 'text-xl'}`} style={{ fontFamily: 'Manrope' }}>{member.name}</h3>
          <p className={`font-black uppercase tracking-[0.15em] mt-0.5 ${compact ? 'text-[9px]' : 'text-[10px]'} ${member.isLeader ? 'text-primary' : 'text-tertiary'}`}>{member.role}</p>
        </div>
        {!compact && (
          <p className="text-on-surface-variant text-xs leading-relaxed max-w-[240px] font-medium opacity-80 group-hover:opacity-100 transition-opacity">{member.description}</p>
        )}
        <div className={compact ? 'mt-1' : 'pt-4'}>
          <a href={member.portfolioUrl} target="_blank" rel="noopener noreferrer"
            className="group/btn inline-flex items-center gap-1 font-black uppercase tracking-widest text-primary hover:text-white transition-all hover:underline"
            style={{ fontSize: compact ? '9px' : '11px' }}
          >
            Portfolio
            <span className="material-symbols-outlined transition-transform group-hover/btn:translate-x-1" style={{ fontSize: compact ? '11px' : '14px' }}>arrow_forward</span>
          </a>
        </div>
      </div>
    </motion.div>
  );
}
