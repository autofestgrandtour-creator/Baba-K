"use client";

import React, { useState, useRef, MouseEvent } from 'react';
import { PurchasedTicket, EventItem } from '@/types';
import { Sparkles, Calendar, MapPin, Tag, ShieldAlert, BadgeCheck, Share2, Download } from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';

interface PremiumTicketProps {
  ticket: PurchasedTicket;
  event: EventItem;
  onSelectAction?: () => void;
  actionLabel?: string;
  isInteractive?: boolean;
}

export const PremiumTicket: React.FC<PremiumTicketProps> = ({
  ticket,
  event,
  onSelectAction,
  actionLabel = 'Manage Ticket',
  isInteractive = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  // Handle high-performance 3D mouse parallax hover effect
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isInteractive || !cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // mouse position relative to element
    const y = e.clientY - rect.top;
    
    // Normalize position: -0.5 to 0.5
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    
    // Calculate rotation: max 15 degrees
    setRotateX(-normY * 18);
    setRotateY(normX * 18);
    
    // Calculate glare circle relative coords
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlare({ x: glareX, y: glareY, opacity: 0.35 });
  };

  const handleMouseLeave = () => {
    if (!isInteractive) return;
    // Reset positions smooth
    setRotateX(0);
    setRotateY(0);
    setGlare(prev => ({ ...prev, opacity: 0 }));
  };

  const handleDownloadPNG = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // 1. Find the high-res hidden QR Code canvas
    const qrCanvas = document.getElementById(`hidden-qr-${ticket.id}`) as HTMLCanvasElement;
    if (!qrCanvas) return;

    // 2. Spawn programmatically scoped drawing Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High quality dimensions
    canvas.width = 600;
    canvas.height = 920;

    // A. Fill high-contrast metal rich background
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGradient.addColorStop(0, '#0E0E10');
    bgGradient.addColorStop(0.5, '#050505');
    bgGradient.addColorStop(1, '#0C0C0D');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // B. Draw neon perimeter highlight border lines
    ctx.strokeStyle = '#00F2FF'; // Electric Cyan
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
    
    ctx.strokeStyle = '#FF00E5'; // Lagos Pink
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);

    // C. Draw header "BABA-K DIGITAL WALLET" banner
    ctx.fillStyle = '#00F2FF';
    ctx.font = '900 13px "Courier New", monospace, "Arial"';
    ctx.fillText('BABA-K DIGITAL WALLET // VERIFIED GENUINE', 40, 52);

    // D. Elegant separator line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(40, 72, canvas.width - 80, 1.5);

    // E. Draw Event Category Tag
    ctx.fillStyle = '#00F2FF';
    ctx.font = '900 10.5px "Courier New", monospace';
    ctx.fillText(event.category.toUpperCase() + ' // EXCLUSIVE GATHERING PASS', 40, 110);

    // F. Draw Event Title wrapping
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 24px "Outfit", "Segoe UI", "Arial", sans-serif';
    const words = event.title.toUpperCase().split(' ');
    let line = '';
    const maxWidth = canvas.width - 80;
    const lineHeight = 34;
    let y = 150;

    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        ctx.fillText(line, 40, y);
        line = words[i] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 40, y);

    y += 20;

    // G. Classic perforation tear stubs (circles)
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(0, y + 10, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(0, y + 10, 20, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(canvas.width, y + 10, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(canvas.width, y + 10, 20, Math.PI / 2, -Math.PI / 2);
    ctx.stroke();

    // Perforation dash dots
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(30, y + 10);
    ctx.lineTo(canvas.width - 30, y + 10);
    ctx.stroke();
    ctx.setLineDash([]); // clear dash

    y += 55;

    // H. Event metadata details
    ctx.fillStyle = '#FF00E5';
    ctx.font = '900 11px "Courier New", monospace';
    ctx.fillText('DATE & SECURE TIME', 40, y);
    ctx.fillStyle = '#E4E4E7';
    ctx.font = '500 15px "Inter", "Arial", sans-serif';
    ctx.fillText(`${event.date} • ${event.time} WAT`, 40, y + 22);

    y += 55;

    ctx.fillStyle = '#00F2FF';
    ctx.font = '900 11px "Courier New", monospace';
    ctx.fillText('OFFICIAL VENUE COORDINATE', 40, y);
    ctx.fillStyle = '#E4E4E7';
    ctx.font = '500 15px "Inter", sans-serif';
    let venueName = event.venue;
    if (ctx.measureText(venueName).width > canvas.width - 80) {
      venueName = venueName.substring(0, 48) + '...';
    }
    ctx.fillText(venueName, 40, y + 22);

    y += 55;

    ctx.fillStyle = '#FF00E5';
    ctx.font = '900 11px "Courier New", monospace';
    ctx.fillText('PASS TIER CLASS', 40, y);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 16px "Inter", sans-serif';
    ctx.fillText(`${ticket.ticketTierName.toUpperCase()} / ₦${ticket.pricePaid.toLocaleString()}`, 40, y + 22);

    y += 65;

    // Divider accent line
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(40, y, canvas.width - 80, 1.5);

    y += 40;

    // I. Attendee owner registry and cryptographic serial reference
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '900 10.5px "Courier New", monospace';
    ctx.fillText('REGISTERED PASS OWNER', 40, y);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px "Outfit", sans-serif';
    ctx.fillText(ticket.buyerName.toUpperCase(), 40, y + 22);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '900 10.5px "Courier New", monospace';
    ctx.fillText('LEDGER SERIAL REFERENCE', 40, y + 55);
    ctx.fillStyle = '#00F2FF';
    ctx.font = '900 14px "Courier New", monospace';
    ctx.fillText(ticket.serialNumber, 40, y + 74);

    // J. Stamp QR Code
    const qrSize = 160;
    const qrX = canvas.width - 200;
    const qrY = y - 10;
    ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);

    // Nice border framing for the QR Code
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(qrX - 6, qrY - 6, qrSize + 12, qrSize + 12);

    // K. Stamp active check-in if validated in state
    if (ticket.isValidated) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(-15 * Math.PI / 180);
      
      // Stamp box
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(-220, -60, 440, 120);
      
      // Stamp border
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.strokeRect(-220, -60, 440, 120);
      ctx.setLineDash([]);
      
      // Main text
      ctx.fillStyle = '#10B981';
      ctx.font = '900 36px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CHECKED-IN', 0, 10);
      
      // Stamp metadata/time
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillText(`VERIFIED PASS // ${ticket.validatedAt ? new Date(ticket.validatedAt).toLocaleTimeString() : ''}`, 0, 36);
      
      ctx.restore();
    }

    // L. Secure footer tag
    ctx.fillStyle = 'rgba(0, 242, 255, 0.35)';
    ctx.font = '900 10px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CRYPTOGRAPHICALLY ACTIVE BABA-K VERIFIED TICKET LEDGER ENTRY', canvas.width / 2, canvas.height - 35);
    ctx.textAlign = 'left';

    // M. Open download
    const imgData = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = imgData;
    downloadLink.download = `BABAK_TICKET_${ticket.serialNumber}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="flex flex-col items-center justify-center p-3 relative select-none">
      
      {/* Visual background shadows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-44 w-60 bg-neon-cyan/20 blur-3xl rounded-full pointer-events-none" />

      {/* Holographic Tilting Wrapper */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
          transition: rotateX === 0 ? 'all 0.5s ease-out' : 'none',
          transformStyle: 'preserve-3d'
        }}
        className="relative w-full max-w-sm rounded-2xl md:min-w-[340px] text-white overflow-hidden hologram-card border border-white/10 hover:border-neon-cyan shadow-2xl transition-all cursor-grab"
      >
        
        {/* Dynamic Glare Reflection Overlay Layer */}
        <div
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, ${glare.opacity}) 0%, transparent 60%)`,
            mixBlendMode: 'overlay',
            pointerEvents: 'none'
          }}
          className="absolute inset-0 z-30 transition-opacity duration-300"
        />

        {/* --- FRONT OF THE INTERACTIVE METROPOLIS TICKET --- */}
        <div className="p-5 flex flex-col justify-between h-[450px] relative bg-[#0D0D0E]/90">
          
          {/* Dynamic Check-in stamp overlay */}
          {ticket.isValidated && (
            <div className="absolute inset-0 bg-[#050505]/85 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center border border-emerald-500/25 m-0.5 rounded-xl">
              <div className="transform -rotate-12 border-2 border-dashed border-emerald-400 text-emerald-400 font-display font-black text-xl uppercase tracking-widest px-4 py-2 rounded-xl bg-emerald-950/25 backdrop-blur-sm shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
                CHECKED-IN
              </div>
              <span className="text-[9px] font-mono text-emerald-400/80 mt-2 bg-black/80 px-2 py-0.5 rounded border border-emerald-500/25">
                {ticket.validatedAt ? new Date(ticket.validatedAt).toLocaleTimeString() : 'Verified pass'}
              </span>
            </div>
          )}
          
          {/* Holographic Chip Accent */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-neon-cyan animate-pulse-slow shrink-0" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#00F2FF] font-black">BABA-K DIGITAL WALLET</span>
            </div>
            {ticket.isReselling ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#FF00E5]/10 text-neon-pink border border-neon-pink/30">
                P2P RESALE ACTIVE
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#00F2FF]/10 text-neon-cyan border border-neon-cyan/30 flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" /> VERIFIED GENUINE
              </span>
            )}
          </div>

          {/* Event Flyer Visual Cover inside Ticket Body */}
          <div className="relative h-28 my-3 rounded-lg overflow-hidden border border-white/5">
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
            <img
              src={event.flyerUrl}
              alt={event.title}
              className="w-full h-full object-cover select-none opacity-80"
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute bottom-2 left-2 right-2 z-20 flex justify-between items-end">
              <div>
                <span className="text-[9px] font-mono uppercase bg-neon-cyan text-black font-black px-1.5 py-0.5 rounded">
                  {event.category.toUpperCase()}
                </span>
                <h4 className="font-display text-sm font-black tracking-tight text-white mt-1 leading-tight uppercase">{event.title}</h4>
              </div>
              <span className="text-xs font-mono font-black text-white">₦{ticket.pricePaid.toLocaleString()}</span>
            </div>
          </div>

          {/* Ticket Metadata Structure */}
          <div className="space-y-2 border-b border-dashed border-white/10 pb-4">
            <div className="flex gap-2 text-xs text-white/70">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-neon-pink" />
              <span className="font-mono text-[11px]">{event.date} • {event.time} WAT</span>
            </div>
            
            <div className="flex gap-2 text-xs text-white/70">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-neon-cyan" />
              <span className="font-sans text-[11px] line-clamp-1">{event.venue}</span>
            </div>

            <div className="flex gap-2 text-xs text-white/70">
              <Tag className="h-3.5 w-3.5 shrink-0 text-neon-pink" />
              <span className="font-mono text-[10.5px] text-white/50">
                Tier: <span className="text-white font-black uppercase">{ticket.ticketTierName}</span>
              </span>
            </div>
          </div>

          {/* Left and Right Visual Circular Cutouts for authentic ticket stub appearance */}
          <div className="absolute left-0 right-0 top-[260px] flex justify-between items-center pointer-events-none">
            <div className="h-5 w-2.5 rounded-r-full bg-[#050505] border-r border-y border-white/10" />
            <div className="h-5 w-2.5 rounded-l-full bg-[#050505] border-l border-y border-white/10" />
          </div>

          {/* QR Code section & Serial Metadata */}
          <div className="flex justify-between items-center pt-3 mt-1">
            <div className="text-left">
              <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider">Attendee Owner</p>
              <h5 className="text-xs font-bold text-white truncate max-w-[140px]">{ticket.buyerName}</h5>
              
              <p className="text-[9px] font-mono text-white/30 uppercase tracking-wider mt-1.5">Ticket Serial Code</p>
              <span className="text-[10px] font-mono font-black text-neon-cyan">{ticket.serialNumber}</span>
            </div>

            {/* Dynamic Real SVG QR Code Generator */}
            <div className="flex flex-col items-center shrink-0">
              <div className="bg-white p-1 rounded-lg border border-zinc-200 shadow-sm">
                <QRCodeSVG
                  value={ticket.qrCode}
                  size={48}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                />
              </div>
              <span className="text-[8px] font-mono text-white/40 mt-1.5 uppercase tracking-tighter font-bold">Secure Scan</span>
            </div>
          </div>

        </div>
      </div>

      {/* Action Buttons under Card */}
      <div className="mt-4 flex gap-2 flex-wrap items-center justify-center">
        {onSelectAction && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectAction();
            }}
            className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-neon-cyan text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-[#00F2FF] hover:bg-zinc-850 transition-all flex items-center gap-1.5 cursor-pointer justify-center"
          >
            <span>{actionLabel}</span>
            <Share2 className="h-3.5 w-3.5 text-zinc-400" />
          </button>
        )}

        <button
          onClick={handleDownloadPNG}
          className="px-5 py-2.5 rounded-xl bg-[#00F2FF] hover:bg-[#00d6e0] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md justify-center"
        >
          <span>Download Pass</span>
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Hidden high-res canvas utilized solely for programmatic pixel alignment during download */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <QRCodeCanvas
          id={`hidden-qr-${ticket.id}`}
          value={ticket.qrCode}
          size={256}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
        />
      </div>

    </div>
  );
};

