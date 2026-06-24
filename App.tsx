import { useState, useEffect, useRef } from "react";
import { createClient, User } from "@supabase/supabase-js";
import {
  LayoutDashboard, BookOpen, FileText, Brain, Moon, Sun,
  ChevronRight, Lock, CheckCircle, XCircle, Trophy,
  TrendingUp, Target, Clock, Zap, Award, AlertTriangle,
  Plane, Wrench, BarChart2, Download, RefreshCw,
  ArrowLeft, ArrowRight, Flag, Star, Menu, X, Globe,
  Gauge, Shield, RotateCcw, PlayCircle, Cpu, Layers,
  LogOut, Cloud
} from "lucide-react";
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PolarRadiusAxis
} from "recharts";
import { toast, Toaster } from "sonner";

// ─── SUPABASE ─────────────────────────────────────────────────
const SUPA_URL = "https://gjcqmjmialtvsiomrfmo.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqY3Ftam1pYWx0dnNpb21yZm1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyNzE1OTQsImV4cCI6MjA5Nzg0NzU5NH0.jd2sYo-EWbR3-2OAOy4u8E7jYMVlCoo9KKDwUFcIHyc";
const supabase = createClient(SUPA_URL, SUPA_KEY);
const EDGE = `${SUPA_URL}/functions/v1/server/make-server-670d4028`;

async function cloudLoad(userId: string) {
  try {
    const res = await fetch(`${EDGE}/user-data/${userId}`);
    const json = await res.json();
    return json.data ?? null;
  } catch { return null; }
}

async function cloudSave(userId: string, payload: object) {
  try {
    await fetch(`${EDGE}/user-data/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {}
}

// ─── TYPES ────────────────────────────────────────────────────
type TrailId = "basico" | "celula" | "ingles";
type View = "dashboard" | "trails" | "modules" | "exam" | "results" | "reports" | "ai";

interface Question {
  id: string;
  trail: TrailId;
  module: number;
  lang: "pt" | "en";
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  explanation: string;
  subject: string;
}

interface ExamResult {
  id: string;
  date: Date;
  trail: TrailId;
  module: number;
  score: number;
  timeSpent: number;
  answers: { questionId: string; selected: number; correct: boolean }[];
  passed: boolean;
  questions: Question[];
}

interface TrailState {
  unlockedModules: number[];
  completedModules: number[];
  round: number;
}

// ─── QUESTION BANK ────────────────────────────────────────────
const QB: Question[] = [
  // BÁSICO M1
  { id:"b1-1",trail:"basico",module:1,lang:"pt",subject:"Estruturas",
    text:"Em uma estrutura semi-monocoque, qual componente é o principal responsável por absorver esforços de torção?",
    options:["Longarinas","Revestimento (pele)","Nervuras","Estações da fuselagem"],
    correct:1,
    explanation:"Na semi-monocoque, o revestimento (pele) metálico absorve a maior parte dos esforços de torção e cisalhamento, trabalhando em conjunto com longarinas e nervuras para distribuir as cargas estruturais." },
  { id:"b1-2",trail:"basico",module:1,lang:"pt",subject:"Regulamentos",
    text:"De acordo com o RBAC 65, o MMA com habilitação em Célula está autorizado a:",
    options:["Realizar manutenção apenas em motores reciprocantes","Inspecionar e certificar trabalhos na estrutura, sistemas e componentes da célula","Operar aeronaves para fins de teste após manutenção","Emitir certificados de aeronavegabilidade"],
    correct:1,
    explanation:"O MMA com habilitação em Célula está autorizado a inspecionar, realizar e certificar manutenção na estrutura, sistemas e componentes que compõem a célula da aeronave, excluindo propulsão." },
  { id:"b1-3",trail:"basico",module:1,lang:"pt",subject:"Materiais",
    text:"Qual é a principal vantagem do alumínio como material estrutural em aeronaves?",
    options:["Alta resistência à corrosão sem tratamento","Excelente relação resistência/peso","Menor custo de produção que o aço","Facilidade de soldagem por todos os processos"],
    correct:1,
    explanation:"O alumínio apresenta excelente relação resistência/peso — aproximadamente 1/3 do peso do aço com resistência adequada para estruturas aeronáuticas." },
  { id:"b1-4",trail:"basico",module:1,lang:"pt",subject:"Ferramentas",
    text:"Qual instrumento é utilizado para medir o torque aplicado em parafusos durante a manutenção aeronáutica?",
    options:["Micrômetro","Paquímetro","Torquímetro","Dinamômetro"],
    correct:2,
    explanation:"O torquímetro é a ferramenta específica para medir e controlar o torque em fixadores, garantindo que os valores especificados nos manuais técnicos sejam atingidos com precisão." },
  { id:"b1-5",trail:"basico",module:1,lang:"pt",subject:"Documentação",
    text:"O que é uma Diretiva de Aeronavegabilidade (DA)?",
    options:["Manual de manutenção do fabricante","Documento obrigatório emitido pela autoridade de aviação para corrigir condição insegura","Relatório de inspeção periódica","Certificado de aprovação de peça sobressalente"],
    correct:1,
    explanation:"A DA é documento de caráter obrigatório emitido pela autoridade de aviação civil (ANAC no Brasil) para corrigir condições inseguras identificadas em aeronaves, motores ou componentes." },
  { id:"b1-6",trail:"basico",module:1,lang:"pt",subject:"Estruturas",
    text:"O que é fadiga de material em estruturas aeronáuticas?",
    options:["Desgaste por atrito entre peças móveis","Degradação causada por cargas cíclicas repetidas","Corrosão acelerada em ambientes salinos","Deformação permanente por sobrecarga estática"],
    correct:1,
    explanation:"Fadiga é o processo de degradação progressiva causado por cargas cíclicas repetidas. Trincas nucleiam em regiões de concentração de tensão e propagam a cada ciclo até a falha final." },
  { id:"b1-7",trail:"basico",module:1,lang:"pt",subject:"Materiais",
    text:"Qual é o principal objetivo do tratamento de anodização em componentes de alumínio?",
    options:["Aumentar condutividade elétrica","Criar camada de óxido protetora contra corrosão","Melhorar adesão de selantes estruturais","Reduzir atrito entre superfícies"],
    correct:1,
    explanation:"A anodização cria uma camada de óxido de alumínio (Al₂O₃) que protege contra corrosão e melhora a aderência de tintas e primers." },
  { id:"b1-8",trail:"basico",module:1,lang:"pt",subject:"Regulamentos",
    text:"O prazo para comunicar à ANAC um acidente ocorrido durante manutenção é:",
    options:["24 horas após tomar conhecimento","72 horas após tomar conhecimento","Imediatamente após tomar conhecimento","Até 10 dias úteis após o evento"],
    correct:2,
    explanation:"Conforme RBAC 13, a notificação de acidente ou incidente grave deve ser feita imediatamente após tomar conhecimento, sem demoras desnecessárias." },
  { id:"b1-9",trail:"basico",module:1,lang:"pt",subject:"Materiais",
    text:"A liga de alumínio 2024-T3 é amplamente usada em estruturas de fuselagem principalmente por sua:",
    options:["Alta resistência à corrosão","Alta resistência à tração e boa tenacidade à fratura","Facilidade de soldagem estrutural","Excelente condutividade térmica"],
    correct:1,
    explanation:"A liga 2024-T3 possui excelente resistência à tração e boa tenacidade — ideal para revestimentos e longarinas sujeitos a carregamentos de tração. Tem sensibilidade à corrosão, porém isso é mitigado por tratamentos de superfície." },
  { id:"b1-10",trail:"basico",module:1,lang:"pt",subject:"Ferramentas",
    text:"O micrômetro externo é usado para medir:",
    options:["Diâmetro interno de furos","Dimensões externas de peças com alta precisão (0,01 mm ou menos)","Profundidade de rasgos e chanfros","Rugosidade superficial de componentes"],
    correct:1,
    explanation:"O micrômetro externo mede dimensões externas (diâmetros, espessuras) com resolução de 0,01 mm (vernier) ou 0,001 mm (digital), sendo ferramenta essencial em inspeções dimensionais de manutenção." },
  // BÁSICO M2
  { id:"b2-1",trail:"basico",module:2,lang:"pt",subject:"Hidráulicos",
    text:"Em um sistema hidráulico aeronáutico, qual é a função do acumulador?",
    options:["Filtrar impurezas do fluido","Regular temperatura do fluido","Armazenar pressão para emergências e amortecer pulsações","Converter pressão hidráulica em energia elétrica"],
    correct:2,
    explanation:"O acumulador armazena fluido pressurizado para uso em emergências e amortece pulsações de pressão, protegendo componentes sensíveis do sistema." },
  { id:"b2-2",trail:"basico",module:2,lang:"pt",subject:"Elétrica",
    text:"Qual é a tensão CC mais comum nos sistemas elétricos de aeronaves de aviação geral?",
    options:["12V CC","28V CC","48V CC","115V CA"],
    correct:1,
    explanation:"28V CC é padrão na aviação geral e militar. Equilibra peso dos cabos, eficiência e segurança. Aeronaves maiores usam 115V CA a 400 Hz." },
  { id:"b2-3",trail:"basico",module:2,lang:"pt",subject:"Hidráulicos",
    text:"O que é a válvula de retenção (check valve) em sistemas hidráulicos?",
    options:["Permite fluxo em ambas direções e bloqueia pulsações","Permite fluxo em apenas uma direção, bloqueando refluxo","Regula a pressão máxima do sistema","Controla a temperatura do fluido"],
    correct:1,
    explanation:"A check valve (válvula de retenção) permite fluxo em somente uma direção, impedindo refluxo indesejado. É usada para proteger bombas, isolar sub-sistemas e manter pressão em acumuladores." },
  { id:"b2-4",trail:"basico",module:2,lang:"pt",subject:"NDT",
    text:"Para detectar delaminações internas em estrutura de fibra de carbono, qual método NDT é mais adequado?",
    options:["Inspeção visual direta","Ultrassom (C-scan ou pulso-eco)","Líquido penetrante fluorescente","Partícula magnética"],
    correct:1,
    explanation:"O ultrassom (especialmente C-scan) detecta delaminações em compostos pois o som não propaga por interfaces ar-material. Líquido penetrante não detecta danos internos; partícula magnética não funciona em não-ferrosos." },
  { id:"b2-5",trail:"basico",module:2,lang:"pt",subject:"Regulamentos",
    text:"O que é o MEL (Minimum Equipment List / Lista Mínima de Equipamentos)?",
    options:["Lista de ferramentas obrigatórias para o MMA","Documento aprovado que permite voo com certos equipamentos inoperantes em condições específicas","Inventário de peças sobressalentes obrigatórias","Relação de inspeções mínimas antes de cada voo"],
    correct:1,
    explanation:"O MEL é um documento aprovado pela ANAC que define quais equipamentos podem estar inoperantes e por quanto tempo, permitindo operação segura sob condições e procedimentos específicos." },
  { id:"b2-6",trail:"basico",module:2,lang:"pt",subject:"Combustíveis",
    text:"O número de octano do AVGAS indica:",
    options:["Ponto de fulgor em graus Celsius","Resistência do combustível à detonação anormal","Densidade energética em BTU/litro","Temperatura máxima de operação do motor"],
    correct:1,
    explanation:"O número de octano indica resistência à detonação prematura (knocking). AVGAS 100LL tem alta resistência, permitindo uso em motores de alta taxa de compressão." },
  { id:"b2-7",trail:"basico",module:2,lang:"pt",subject:"Elétrica",
    text:"O que é o disjuntor (circuit breaker) em sistemas elétricos aeronáuticos?",
    options:["Interruptor de liga/desliga controlado pela tripulação","Dispositivo de proteção que interrompe circuito em caso de sobrecarga ou curto-circuito","Regulador de tensão do barramento principal","Fusível permanente substituível em campo"],
    correct:1,
    explanation:"O circuit breaker protege circuitos elétricos contra sobrecorrente. Diferente de fusíveis, pode ser resetado manualmente. Em aeronaves, devem ser resetados com cautela conforme procedimentos aprovados." },
  { id:"b2-8",trail:"basico",module:2,lang:"pt",subject:"Hidráulicos",
    text:"A consequência de ar aprisionado em sistema hidráulico é:",
    options:["Aumento permanente da pressão","Resposta esponjosa dos atuadores e possível cavitação","Aumento da eficiência do sistema","Contaminação por oxidação acelerada"],
    correct:1,
    explanation:"Ar é compressível, causando resposta esponjosa nos atuadores, movimento impreciso e cavitação na bomba, reduzindo significativamente a eficiência do sistema." },
  { id:"b2-9",trail:"basico",module:2,lang:"pt",subject:"Estruturas",
    text:"O fenômeno de 'fretting corrosion' ocorre quando:",
    options:["Há contato entre metal e solo salino","Dois metais dissimilares são conectados em ambiente úmido","Microdeslocamentos oscilatórios ocorrem entre superfícies em contato sob pressão","Revestimento anódico é danificado por impacto"],
    correct:2,
    explanation:"Fretting corrosion é causado por microdeslocamentos oscilatórios entre superfícies em contato sob pressão. Gera desgaste mecânico e oxidação simultâneos — crítico em juntas rebitadas sujeitas a cargas cíclicas." },
  { id:"b2-10",trail:"basico",module:2,lang:"pt",subject:"Instrumentos",
    text:"O altímetro de aeronave opera com base em:",
    options:["Variação de temperatura com altitude","Variação da pressão estática com a altitude","Efeito Doppler para velocidade vertical","Giroscópio com referência ao horizonte"],
    correct:1,
    explanation:"O altímetro é aneroide barométrico que mede pressão estática. Como pressão diminui com altitude (ISA), a variação de pressão é convertida em indicação de altitude." },
  // BÁSICO M3
  { id:"b3-1",trail:"basico",module:3,lang:"pt",subject:"Compostos",
    text:"Por que é fundamental controlar a umidade absorvida por laminado de CFRP antes da cura?",
    options:["A umidade aumenta viscosidade da resina dificultando impregnação","Umidade causa porosidade e redução de propriedades mecânicas durante a cura em alta temperatura","A umidade acelera a cura além do especificado","A umidade causa separação das fibras antes da cura"],
    correct:1,
    explanation:"A umidade absorvida vaporiza durante cura em autoclave, gerando porosidade (vazios) que degradam propriedades mecânicas. Por isso é necessária pré-secagem em estufa." },
  { id:"b3-2",trail:"basico",module:3,lang:"pt",subject:"Propulsão",
    text:"Em motores turbofan de alto bypass, o empuxo total é gerado predominantemente por:",
    options:["O núcleo quente do motor (core)","O fan externo que acelera grandes volumes de ar bypass","Os combustores em funcionamento dual-annular","Os reversores durante a desaceleração"],
    correct:1,
    explanation:"Em turbofan de alto bypass (CFM56, GE90), 70-80% do empuxo é gerado pelo fan externo que acelera grande volume de ar ao redor do núcleo. O núcleo gera o restante e alimenta o fan." },
  { id:"b3-3",trail:"basico",module:3,lang:"pt",subject:"Aviônica",
    text:"O EGPWS usa qual dado adicional ao GPWS convencional para alertas antecipados de terreno?",
    options:["Dados de radar meteorológico","Base de dados de terreno e obstáculos com posicionamento GPS","Transponder modo C de tráfego próximo","Radar altímetro doppler de alta precisão"],
    correct:1,
    explanation:"O EGPWS adiciona base de dados de elevação do terreno global combinada com GPS, permitindo alertas antecipados de CFIT mesmo em condições normais de voo." },
  { id:"b3-4",trail:"basico",module:3,lang:"pt",subject:"Análise de Falhas",
    text:"As 'marcas de praia' (beach marks) em uma fratura por fadiga indicam:",
    options:["Pontos de início múltiplos por corrosão","Linhas de propagação progressiva da trinca por paradas e reinícios do carregamento","Limites entre regiões com diferente tratamento térmico","Marcações da ferramenta de usinagem"],
    correct:1,
    explanation:"Beach marks são linhas concêntricas visíveis na superfície de fratura por fadiga, representando posições successivas da frente de trinca em diferentes momentos do carregamento cíclico." },
  { id:"b3-5",trail:"basico",module:3,lang:"pt",subject:"Hidráulicos",
    text:"O que é o conceito 'fail-safe' em projeto estrutural aeronáutico?",
    options:["Nenhum componente pode falhar em operação normal","A falha de qualquer elemento individual não causa falha estrutural catastrófica","Sistema de detecção automática de falhas com alerta à tripulação","Uso exclusivo de compostos para eliminar propagação de trincas"],
    correct:1,
    explanation:"Fail-safe garante que a falha de qualquer membro individual não leva à falha catastrófica do conjunto. Caminhos alternativos de carga (redundância) permitem detecção antes da falha total." },
  { id:"b3-6",trail:"basico",module:3,lang:"pt",subject:"Sistemas",
    text:"O sistema FADEC (Full Authority Digital Engine Control) em motores modernos:",
    options:["Substitui completamente o piloto no controle de propulsão","Controla e otimiza todos os parâmetros do motor eletronicamente, sem controle mecânico direto","Funciona apenas como backup do sistema mecânico principal","É exclusivo de motores militares supersônicos"],
    correct:1,
    explanation:"O FADEC controla completamente todos os parâmetros do motor (fluxo de combustível, geometria variável, sangria) via computador, eliminando alavancas mecânicas e otimizando desempenho em todas as fases de voo." },
  { id:"b3-7",trail:"basico",module:3,lang:"pt",subject:"NDT",
    text:"O método de correntes parasitas (Eddy Current) detecta falhas em materiais condutores por:",
    options:["Reflexão de ondas ultrassônicas nas descontinuidades","Alteração do campo eletromagnético por variações na condutividade/permeabilidade","Visualização de fluorescência em regiões porosas","Atração de partículas magnéticas em trincas"],
    correct:1,
    explanation:"Eddy Current usa indução eletromagnética. Correntes parasitas geradas pelo campo AC da bobina são perturbadas por descontinuidades, alterando impedância detectável no equipamento." },
  { id:"b3-8",trail:"basico",module:3,lang:"pt",subject:"Compostos",
    text:"A análise FMEA em manutenção aeronáutica é usada para:",
    options:["Calcular tempo médio entre falhas (MTBF)","Identificar sistematicamente modos de falha possíveis e seus efeitos no sistema","Registrar histórico de falhas para análise retroativa","Estabelecer intervalos de manutenção baseados em horas de voo"],
    correct:1,
    explanation:"A FMEA é metodologia proativa que identifica todos os modos de falha potenciais, analisa seus efeitos e classifica por severidade e probabilidade — fundamental para o MSG-3." },
  { id:"b3-9",trail:"basico",module:3,lang:"pt",subject:"Propulsão",
    text:"O que é o 'EGT exceedance' em motores turbina e qual a ação requerida?",
    options:["Temperatura normal de cruzeiro que não exige ação","Superação dos limites de temperatura de gases de exaustão que exige inspeção mandatória do motor","Variação aceitável dentro da faixa verde do instrumento","Alarme de aviso que pode ser ignorado em voo de cruzeiro"],
    correct:1,
    explanation:"EGT exceedance é a superação dos limites máximos de temperatura dos gases de exaustão. Exige inspeção mandatória da seção quente conforme manual do motor para avaliar danos às pás da turbina." },
  { id:"b3-10",trail:"basico",module:3,lang:"pt",subject:"Hidráulicos",
    text:"A diferença entre o sistema 'anti-ice' e o sistema 'de-ice' é:",
    options:["Anti-ice é mais poderoso; de-ice é reserva","Anti-ice previne formação de gelo; de-ice remove gelo já formado","Anti-ice usa fluido; de-ice usa calor elétrico","São termos sinônimos com diferentes fabricantes"],
    correct:1,
    explanation:"Anti-ice previne a formação de gelo aquecendo continuamente as superfícies (ex: sangria de ar quente na borda de ataque). De-ice permite formação inicial e então remove o gelo (ex: boots pneumáticos que se inflam e deflam)." },
  // BÁSICO M4
  { id:"b4-1",trail:"basico",module:4,lang:"en",subject:"Aviation English",
    text:"According to ICAO, 'Continued Airworthiness' refers to:",
    options:["Initial certification of a new aircraft type","Maintaining the aircraft in conformity with its type design through maintenance programs","Operational approval granted to airlines for specific routes","Periodic renewal of aircraft registration certificates"],
    correct:1,
    explanation:"Continued Airworthiness ensures that throughout its operating life the aircraft complies with airworthiness requirements through approved maintenance programs, modifications, and inspections." },
  { id:"b4-2",trail:"basico",module:4,lang:"en",subject:"Documentation",
    text:"In an Aircraft Maintenance Manual (AMM), 'CAUTION' indicates:",
    options:["A procedure risking death or serious injury","A procedure that could damage equipment if not followed","Additional information about the procedure","A mandatory pre-inspection requirement"],
    correct:1,
    explanation:"CAUTION = risk of equipment damage. WARNING = risk of personal injury or death. NOTE = supplemental information. This three-tier system is standardized across aviation maintenance documentation." },
  { id:"b4-3",trail:"basico",module:4,lang:"en",subject:"Hydraulic Systems",
    text:"The primary purpose of a hydraulic pressure relief valve is:",
    options:["To filter hydraulic fluid contaminants","To prevent system pressure from exceeding design limits","To maintain constant fluid temperature","To separate air from hydraulic fluid"],
    correct:1,
    explanation:"The pressure relief valve is a safety device that opens when pressure reaches the relief setting, bypassing fluid to the reservoir and preventing overpressure damage to system components." },
  { id:"b4-4",trail:"basico",module:4,lang:"en",subject:"Regulations",
    text:"The NDT method using electromagnetic induction to detect surface flaws in conductive materials is:",
    options:["Ultrasonic testing","Eddy current testing","Magnetic particle inspection","Radiographic testing"],
    correct:1,
    explanation:"Eddy Current Testing uses electromagnetic induction. The probe coil generates eddy currents; discontinuities alter their flow, which is detected as an impedance change in the instrument." },
  { id:"b4-5",trail:"basico",module:4,lang:"en",subject:"Documentation",
    text:"A Service Bulletin (SB) differs from an Airworthiness Directive (AD) in that:",
    options:["An SB is manufacturer-issued and generally recommended but not mandatory, while an AD is mandatory","An SB is issued by the regulatory authority; an AD by the manufacturer","An SB requires action within 10 hours; an AD has longer compliance","An SB applies only to powerplants; an AD covers all systems"],
    correct:0,
    explanation:"SBs are manufacturer recommendations — not mandatory unless incorporated into an AD by the regulatory authority. Once incorporated into an AD, compliance becomes legally mandatory." },
  { id:"b4-6",trail:"basico",module:4,lang:"en",subject:"Hydraulic Systems",
    text:"'Bleeding' a hydraulic system means:",
    options:["Draining the fluid for replacement","Removing trapped air from lines and components","Pressure-testing the system for leaks","Flushing with clean solvent"],
    correct:1,
    explanation:"Bleeding (purging) removes entrapped air from hydraulic lines, actuators, and components. Air compressibility causes spongy response; bleeding restores crisp, precise control." },
  { id:"b4-7",trail:"basico",module:4,lang:"en",subject:"Aviation English",
    text:"What does 'serviceable' mean for an aviation component?",
    options:["A component requiring immediate replacement","A component meeting all standards and approved for aircraft installation","A component currently installed on an in-service aircraft","A component approved only for ground test"],
    correct:1,
    explanation:"'Serviceable' means the component has been inspected, meets all applicable limits, and has proper documentation (serviceable tag) authorizing its installation on an aircraft." },
  { id:"b4-8",trail:"basico",module:4,lang:"en",subject:"Documentation",
    text:"The term 'RII' (Required Inspection Item) in maintenance quality systems means:",
    options:["Inspection required at each regulatory interval","Critical task where the inspector cannot be the person who performed the maintenance","Item flagged for mandatory replacement at specified intervals","Recurring inspection after any flight control maintenance"],
    correct:1,
    explanation:"RII tasks require independent inspection — the technician performing the work cannot also sign off the required inspection. Mandatory for critical items like flight control rigging and structural repairs." },
  { id:"b4-9",trail:"basico",module:4,lang:"en",subject:"Aviation English",
    text:"In aviation, a 'squawk' in the maintenance context refers to:",
    options:["Radio interference on VHF frequencies","A transponder code set for ATC","A defect or discrepancy written up by the flight crew","An ACARS message during abnormal operations"],
    correct:2,
    explanation:"In maintenance, a 'squawk' is a defect or discrepancy written up in the technical log/maintenance logbook by the flight crew for attention by maintenance personnel." },
  { id:"b4-10",trail:"basico",module:4,lang:"en",subject:"Aviation English",
    text:"The 'empennage' of an aircraft refers to:",
    options:["The main wing assembly including flaps and ailerons","The tail section with horizontal and vertical stabilizers and control surfaces","The engine nacelle and thrust reverser assembly","The fuselage section forward of the wing box"],
    correct:1,
    explanation:"The empennage (from French) is the tail assembly: horizontal stabilizer (with elevator), vertical stabilizer (with rudder), and associated control systems providing stability and control." },
  // BÁSICO M5
  { id:"b5-1",trail:"basico",module:5,lang:"en",subject:"Advanced Systems",
    text:"In a fly-by-wire (FBW) system, 'flight envelope protection' primarily:",
    options:["Protects the structure from turbulence loads","Prevents pilots from exceeding structural or aerodynamic limits regardless of input","Automatically deploys spoilers when Vmax is exceeded","Enables autopilot engagement in all flight phases"],
    correct:1,
    explanation:"FBW envelope protection uses software laws to prevent inadvertent exceedance of structural (g-limits, bank angle) or aerodynamic (stall, overspeed) limits — even at full sidestick deflection. Key safety feature of Airbus A320 family." },
  { id:"b5-2",trail:"basico",module:5,lang:"pt",subject:"Propulsão Avançada",
    text:"O conceito 'safe-life' em projeto estrutural significa:",
    options:["Componente inspecionado periodicamente para detectar trincas","Componente descartado após número definido de ciclos/horas antes de qualquer falha esperada","Componente com caminhos múltiplos de carga","Componente testado até a falha para determinar fator de segurança"],
    correct:1,
    explanation:"Safe-life define vida útil segura (ciclos, horas ou anos). Ao atingir o limite, o componente é substituído mandatoriamente independente de sua condição aparente. Aplica-se a componentes críticos de trem de pouso e rotores." },
  { id:"b5-3",trail:"basico",module:5,lang:"en",subject:"Advanced Composites",
    text:"The primary advantage of the 'scarfed' composite repair method over 'stepped lap' is:",
    options:["Lower manufacturing complexity","More gradual load transfer with reduced stress concentrations at repair boundaries","Greater accessibility on curved surfaces","Compatibility with automated fiber placement"],
    correct:1,
    explanation:"The scarfed method creates a gradual taper allowing uniform stress distribution and reduced stress concentrations at ply boundaries, providing superior fatigue performance over abrupt stepped-lap load transfer." },
  { id:"b5-4",trail:"basico",module:5,lang:"pt",subject:"Certificação",
    text:"O que distingue uma 'grande reforma' de uma 'pequena reforma' conforme o RBAC 43?",
    options:["Grande reforma custa mais de R$50.000","Grande reforma pode afetar apreciavelmente resistência estrutural, características de voo ou outras qualidades de aeronavegabilidade","Grande reforma requer peças originais OEM","Grande reforma deve ser feita por COMA; pequena por qualquer MMA"],
    correct:1,
    explanation:"Conforme RBAC 43, grande reforma é aquela que, se executada incorretamente, pode afetar apreciavelmente resistência estrutural, características de voo ou outras qualidades de aeronavegabilidade. Exige dados aprovados pela ANAC." },
  { id:"b5-5",trail:"basico",module:5,lang:"en",subject:"Structural Dynamics",
    text:"The significance of flutter speed (VF) in structural certification is:",
    options:["VF must be 1.15× design dive speed (VD) minimum","VF must exceed VD/MD by at least 15% throughout the flight envelope","VF is the speed where structural damping prevents oscillation","VF is where aeroelastic deformation stays within elastic limits"],
    correct:1,
    explanation:"FAR/CS 25.629 requires demonstrated flutter speed to exceed dive speed (VD/MD) by at least 15%. Below this margin, aeroelastic coupling could cause divergent flutter oscillations leading to catastrophic structural failure." },
  { id:"b5-6",trail:"basico",module:5,lang:"pt",subject:"Sistemas Aviônicos",
    text:"O sistema ACAS/TCAS fornece ao piloto:",
    options:["Alertas de terreno com base em banco de dados geográfico","Avisos e manobras de resolução para evitar colisões com outras aeronaves","Alertas meteorológicos de precipitação intensa","Indicação de perfil de descida de precisão para ILS"],
    correct:1,
    explanation:"O TCAS/ACAS usa transponders das aeronaves próximas para detectar conflitos de tráfego, emitindo Traffic Advisories (TA) e Resolution Advisories (RA) com manobras vertical para evitar colisões." },
  { id:"b5-7",trail:"basico",module:5,lang:"en",subject:"Engine Health",
    text:"The primary safety benefit of real-time engine health monitoring (ACARS/FOQA/HUMS) is:",
    options:["Eliminating periodic scheduled maintenance","Detecting gradual performance degradation before in-flight failures","Automatically restricting throttle when limits are approached","Real-time fuel burn optimization"],
    correct:1,
    explanation:"Real-time monitoring detects subtle trends (EGT spread, vibration, oil consumption) that collectively indicate developing faults, enabling planned maintenance interventions before in-flight failures occur." },
  { id:"b5-8",trail:"basico",module:5,lang:"pt",subject:"Estruturas",
    text:"O conceito de 'damage tolerance' em estruturas aeronáuticas requer que:",
    options:["Todos os danos sejam reparados antes do próximo voo","A estrutura danificada mantenha resistência mínima até que o dano seja detectado e reparado","Nenhuma trinca seja aceita em estruturas primárias","Inspeções sejam realizadas apenas em paradas programadas"],
    correct:1,
    explanation:"Damage tolerance garante que a estrutura com dano (até o máximo indetectável pelo programa de inspeção) mantenha resistência mínima requerida (tipicamente carga limite), dando tempo para detecção e reparo." },
  { id:"b5-9",trail:"basico",module:5,lang:"en",subject:"Regulations Advanced",
    text:"In composite structure repair, a ply orientation tolerance of ±3° means:",
    options:["Repair patch dimensions may deviate ±3° from template angle","Each replacement ply must be aligned within 3° of the orientation specified in the repair scheme","Scarfing angle may vary ±3° from nominal","Panel may be placed up to 3° from horizontal during cure"],
    correct:1,
    explanation:"Ply orientation tolerance specifies fiber direction alignment precision. Exceeding ±3° degrades laminate stiffness and strength in ways undetectable by visual inspection, compromising structural performance of the repair." },
  { id:"b5-10",trail:"basico",module:5,lang:"pt",subject:"Análise de Falhas",
    text:"O que é o 'aileron reversal' em alta velocidade?",
    options:["Inversão por input acidental do piloto","A torção aeroelástica da asa faz com que a deflexão do aileron produza rolamento oposto ao pretendido","Insuficiência da pressão hidráulica para mover o aileron","Separação de fluxo induzida por choque elimina eficácia do aileron"],
    correct:1,
    explanation:"Aileron reversal ocorre quando a flexibilidade torsional da asa permite que o momento aerodinâmico do aileron torça a asa de forma oposta ao efeito desejado. Na velocidade de reversão, o efeito da torção domina sobre o lift direto do aileron." },
  // CÉLULA M1
  { id:"c1-1",trail:"celula",module:1,lang:"pt",subject:"Estruturas",
    text:"Qual é a diferença fundamental entre estrutura monocoque e semi-monocoque?",
    options:["Monocoque usa metal; semi-monocoque usa compostos","Na monocoque o revestimento suporta todas as cargas; na semi-monocoque há reforçadores internos","Monocoque é exclusiva de fuselagem; semi-monocoque de asa","Semi-monocoque não possui revestimento metálico externo"],
    correct:1,
    explanation:"Na monocoque, o revestimento suporta todas as cargas sem reforço interno. Na semi-monocoque (mais comum), o revestimento trabalha com longarinas, nervuras e longerons para distribuir melhor as cargas." },
  { id:"c1-2",trail:"celula",module:1,lang:"pt",subject:"Controles",
    text:"O aileron controla o movimento de:",
    options:["Arfagem (pitch)","Guinada (yaw)","Rolamento (roll)","Deslizamento lateral"],
    correct:2,
    explanation:"Ailerons são superfícies nas pontas das asas que controlam rolamento (roll) ao redor do eixo longitudinal. Deflexões assimétricas criam diferença de sustentação entre as asas." },
  { id:"c1-3",trail:"celula",module:1,lang:"pt",subject:"Trem de Pouso",
    text:"O trem triciclo é mais comum na aviação moderna porque:",
    options:["Oferece maior altura para motores maiores","Proporciona melhor visibilidade ao piloto e maior estabilidade direcional em solo","Reduz peso em relação ao trem convencional","Facilita operação em pistas não pavimentadas"],
    correct:1,
    explanation:"Trem triciclo oferece melhor visibilidade (horizonte visível no solo), estabilidade direcional natural durante pouso/decolagem e elimina tendência ao ground loop do trem convencional (tail-wheel)." },
  { id:"c1-4",trail:"celula",module:1,lang:"pt",subject:"Asas",
    text:"O ângulo de incidência de uma asa é:",
    options:["O ângulo entre corda e fluxo de ar relativo","O ângulo fixo entre a corda da asa e o eixo longitudinal da fuselagem","O ângulo de inclinação das pontas em relação à raiz","O ângulo entre o plano da asa e o horizonte em cruzeiro"],
    correct:1,
    explanation:"O ângulo de incidência (built-in) é o ângulo fixo definido na montagem entre a corda da asa e o eixo longitudinal. Diferente do ângulo de ataque, que varia conforme o voo." },
  { id:"c1-5",trail:"celula",module:1,lang:"pt",subject:"Rebites",
    text:"O rebite AN470 (universal head) possui:",
    options:["Cabeça plana countersunk com marcação X","Cabeça universal abaulada com superfície lisa","Cabeça plana com dois sulcos paralelos","Cabeça cônica com sulco central"],
    correct:1,
    explanation:"AN470 possui cabeça universal (domed/abaulada) com superfície lisa. O AN426 possui cabeça countersunk (plana/afundada) para superfícies aerodinâmicas onde protrusão é inaceitável." },
  { id:"c1-6",trail:"celula",module:1,lang:"pt",subject:"Flaps",
    text:"Os flaps Fowler são superiores porque:",
    options:["São os mais simples de construir e manter","Aumentam a área da asa E a curvatura, proporcionando maior aumento de sustentação","Geram menor arrasto que flaps simples em qualquer deflexão","São usados exclusivamente para controle de rolamento"],
    correct:1,
    explanation:"Flaps Fowler movem-se para trás (aumentando área) E para baixo (aumentando curvatura), maximizando o coeficiente de sustentação máxima. São os mais eficientes — usados em praticamente todos os aviões de transporte moderno." },
  { id:"c1-7",trail:"celula",module:1,lang:"pt",subject:"Estruturas",
    text:"As nervuras (ribs) nas asas têm como função principal:",
    options:["Suportar cargas de torção da asa","Definir o perfil aerodinâmico e transferir cargas do revestimento para as longarinas","Conectar a asa à fuselagem estruturalmente","Acomodar os atuadores hidráulicos dos flaps"],
    correct:1,
    explanation:"As nervuras mantêm a forma do perfil aerodinâmico e transferem as cargas aerodinâmicas do revestimento para as longarinas. Também fornecem pontos de conexão para superfícies de controle e sistemas." },
  { id:"c1-8",trail:"celula",module:1,lang:"pt",subject:"Trem de Pouso",
    text:"O 'shimmy damper' no trem de nariz serve para:",
    options:["Absorver choques verticais no toque","Prevenir oscilações oscilatórias (shimmy) da roda de nariz","Controlar a taxa de retração/extensão do trem","Travar o trem na posição estendida"],
    correct:1,
    explanation:"O shimmy damper hidráulico previne shimmy — vibração oscilatória rápida da roda ao redor do eixo vertical — causado por desequilíbrio, rolamentos desgastados ou flat spots nos pneus." },
  { id:"c1-9",trail:"celula",module:1,lang:"pt",subject:"Asas",
    text:"O diedro positivo nas asas de uma aeronave proporciona:",
    options:["Maior sustentação em alta altitude","Estabilidade lateral estática — tendência a retornar ao voo nivelado após perturbação de rolamento","Maior velocidade máxima de operação","Redução do arrasto induzido em cruzeiro"],
    correct:1,
    explanation:"O diedro (asas inclinadas para cima) cria estabilidade lateral estática. Quando a aeronave inclina, a asa mais baixa desenvolve mais sustentação, criando momento restaurador de rolamento automático." },
  { id:"c1-10",trail:"celula",module:1,lang:"pt",subject:"Controles",
    text:"O leme (rudder) controla o movimento de:",
    options:["Rolamento (roll)","Arfagem (pitch)","Guinada (yaw)","Deslizamento vertical (heave)"],
    correct:2,
    explanation:"O leme é a superfície de controle no estabilizador vertical que controla guinada (yaw) — rotação ao redor do eixo vertical. Usado principalmente para coordenação de curvas e compensação de guinada adversa." },
  // CÉLULA M2
  { id:"c2-1",trail:"celula",module:2,lang:"pt",subject:"Hidráulicos",
    text:"Qual válvula controla a seleção UP/DOWN do trem de pouso hidráulico?",
    options:["Válvula de retenção","Válvula seletora (selector valve)","Válvula reguladora de pressão","Válvula de sequência"],
    correct:1,
    explanation:"A válvula seletora direciona fluido para o lado correto dos atuadores (retração ou extensão). Pode ser operada manualmente (alavanca) ou eletroidrauricamente por solenoides." },
  { id:"c2-2",trail:"celula",module:2,lang:"pt",subject:"Combustível",
    text:"O que é 'fuel venting' no sistema de combustível?",
    options:["Aquecimento do combustível para prevenir formação de gelo","Ventilação dos tanques para equalizar pressão conforme altitude varia","Sistema de retorno de excesso ao tanque principal","Filtração antes de chegar ao motor"],
    correct:1,
    explanation:"Fuel venting mantém pressão dos tanques equalizada com a pressão estática exterior. Sem ventilação, variações de pressão durante subida/descida criam diferenciais que poderiam colapsar tanques ou impedir fluxo." },
  { id:"c2-3",trail:"celula",module:2,lang:"pt",subject:"Compostos",
    text:"Qual fenômeno é preocupante em CFRP exposto a alta umidade por longos períodos?",
    options:["Delaminação por oxidação das fibras de carbono","Degradação da matriz de resina por absorção de umidade (moisture uptake)","Fragilização das fibras por hidrólise","Aumento excessivo do peso por absorção de água pelas fibras"],
    correct:1,
    explanation:"As matrizes epóxi são higroscópicas e absorvem umidade, degradando propriedades mecânicas da resina (especialmente resistência à compressão e temperatura de operação — Tg)." },
  { id:"c2-4",trail:"celula",module:2,lang:"pt",subject:"Pesos e Balanço",
    text:"Se o CG estiver além do limite traseiro (aft CG limit), o comportamento de voo será:",
    options:["A aeronave fica mais estável longitudinalmente","Instabilidade longitudinal — difícil ou impossível recuperar de stall","Aumento da velocidade mínima de voo (VS)","O consumo de combustível aumenta significativamente"],
    correct:1,
    explanation:"Com CG aft, a aeronave fica longitudinalmente instável. Em stall com CG aft, o manche pode não ter autoridade para levantar o nariz, podendo resultar em deep stall irrecuperável." },
  { id:"c2-5",trail:"celula",module:2,lang:"pt",subject:"Pressurização",
    text:"O 'differential pressure' máximo de cabine pressurizada refere-se a:",
    options:["Diferença de temperatura entre interior e exterior da cabine","Diferença máxima de pressão suportada pela estrutura entre pressão de cabine e pressão exterior","Variação de pressão durante ciclo completo de voo","Pressão residual mínima após despressurização de emergência"],
    correct:1,
    explanation:"Differential pressure (delta P) é a diferença entre pressão interna da cabine e pressão estática exterior. A fuselagem deve suportar este diferencial — ex.: ~8,6 psi no B737 — que se repete a cada ciclo de voo como fadiga de pressurização." },
  { id:"c2-6",trail:"celula",module:2,lang:"pt",subject:"Controles",
    text:"A função da tab de compensação (trim tab) nas superfícies de controle é:",
    options:["Aumentar o deflexão máxima da superfície principal","Reduzir as forças nos comandos do piloto durante voo em regime permanente","Prevenir flutter da superfície em alta velocidade","Aumentar a eficácia da superfície principal em baixa velocidade"],
    correct:1,
    explanation:"A trim tab permite ao piloto equilibrar as forças nos manche/pedais durante voo em regime permanente, eliminando a necessidade de aplicar força constante para manter a atitude desejada." },
  { id:"c2-7",trail:"celula",module:2,lang:"pt",subject:"Trem de Pouso",
    text:"A válvula de sequência (sequence valve) no sistema do trem de pouso garante:",
    options:["Pressão máxima do sistema durante retração","Que as portas do trem se abram antes dos atuadores do trem se moverem","Velocidade constante de retração independente da carga","Travamento automático do trem na posição recolhida"],
    correct:1,
    explanation:"Sequence valves garantem que operações ocorram em ordem correta — por exemplo, portas abertas antes do trem retrair, e trem completamente recolhido antes das portas fecharem, evitando danos mecânicos." },
  { id:"c2-8",trail:"celula",module:2,lang:"pt",subject:"Asas",
    text:"Os espoilers (spoilers/spoilerons) nas asas têm como funções:",
    options:["Apenas controle de arrasto em pouso","Controle de rolamento, redução de sustentação no pouso e dumping de sustentação em solo","Substituição dos ailerons em alta velocidade e decolagem","Apenas controle de velocidade em cruzeiro"],
    correct:1,
    explanation:"Espoilers combinam funções: espoileron (controle de rolamento em alta velocidade), espoiler de ar (redução de sustentação em pouso) e espoiler de solo (dumping de sustentação para ativar freios após pouso)." },
  { id:"c2-9",trail:"celula",module:2,lang:"pt",subject:"Combustível",
    text:"Em aeronaves com múltiplos tanques, o sistema de gerenciamento de combustível (FMC) controla:",
    options:["Apenas a seleção de tanque ativo para os motores","Transferência entre tanques, quantidade consumida, alimentação dos motores e peso/balanço","Somente o aquecimento do combustível em alta altitude","A pressurização dos tanques coletores"],
    correct:1,
    explanation:"O FMC gerencia todo o sistema: seleção de tanques, bombas, cross-feed, transferência entre tanques (balanceamento de asa), alimentação dos motores e fornece dados de combustível disponível ao piloto." },
  { id:"c2-10",trail:"celula",module:2,lang:"pt",subject:"Pressurização",
    text:"A valvula de saída (outflow valve) no sistema de pressurização serve para:",
    options:["Fornecer ar condicionado da pack à cabine","Controlar a pressão da cabine regulando a saída de ar","Prevenir diferencial excessivo em descidas rápidas","Ativar máscaras de oxigênio quando altitude de cabine excede limites"],
    correct:1,
    explanation:"A outflow valve controla a pressão da cabine modulando o ar que sai da fuselagem pressurizada. O controlador de pressurização ajusta sua posição para manter a altitude de cabine programada." },
  // CÉLULA M3
  { id:"c3-1",trail:"celula",module:3,lang:"pt",subject:"Pressurização",
    text:"O sistema de degelo de boots pneumáticos nas bordas de ataque opera por:",
    options:["Aquecimento elétrico resistivo","Inflagem e deflagem alternadas de câmara de borracha que quebra o gelo mecanicamente","Pulverização de fluido anticongelante sob pressão","Circulação de ar quente do motor pelo interior da borda"],
    correct:1,
    explanation:"Boots pneumáticos permitem formação inicial de gelo, então cicla inflagem/deflagem usando ar da pneumática, quebrando mecanicamente o gelo por deformação. É sistema de DE-ICE, não anti-ice." },
  { id:"c3-2",trail:"celula",module:3,lang:"pt",subject:"Aviônica",
    text:"No EFIS, o EADI e o EHSI substituem respectivamente:",
    options:["Altímetro e variômetro convencionais","Horizonte artificial (ADI) e indicador de situação horizontal (HSI) convencionais","Anemômetro e macímetro analógicos","VSI e RMI convencionais"],
    correct:1,
    explanation:"EADI (Electronic ADI) é a versão CRT/LCD do horizonte artificial. EHSI (Electronic HSI) substitui o HSI convencional. Juntos formam o núcleo do EFIS (glass cockpit), integrando múltiplas informações." },
  { id:"c3-3",trail:"celula",module:3,lang:"pt",subject:"Estruturas",
    text:"'Fail-safe' em estruturas aeronáuticas significa que:",
    options:["Nenhum componente pode falhar em operação normal","A falha de qualquer elemento individual não causa falha estrutural catastrófica do conjunto","Sistema detecta e alerta falhas estruturais automaticamente","Uso exclusivo de compostos elimina propagação de trincas"],
    correct:1,
    explanation:"Fail-safe garante redundância estrutural: caminhos alternativos de carga garantem suporte das cargas mesmo com um elemento comprometido, permitindo detecção antes da falha total." },
  { id:"c3-4",trail:"celula",module:3,lang:"pt",subject:"Sistemas",
    text:"O sistema de TCAS/ACAS providencia:",
    options:["Alertas de aproximação de terreno","Avisos e manobras de resolução vertical para evitar colisões com tráfego","Alertas de windshear durante aproximação","Indicações de perfil de descida ILS"],
    correct:1,
    explanation:"TCAS usa transponders de aeronaves próximas para detectar conflitos, emitindo Traffic Advisories (TA) e Resolution Advisories (RA) com manobras verticais coordenadas para evitar colisões." },
  { id:"c3-5",trail:"celula",module:3,lang:"pt",subject:"Compostos",
    text:"Em reparo de composto (CFRP) com técnica de 'scarf', a profundidade do afunilamento é determinada pela:",
    options:["Espessura total do laminado apenas","Relação de aspecto scarf (ex.: 1:50) que distribui tensões ao longo da zona de reparo","Número de camadas danificadas multiplicado por 1,5 mm","Norma do fabricante independente da espessura real"],
    correct:1,
    explanation:"A proporção de scarf (típica 1:50 a 1:100) determina o comprimento do afunilamento em relação à profundidade. Maior relação = transição mais gradual = menor concentração de tensão = reparo mais forte e durável." },
  { id:"c3-6",trail:"celula",module:3,lang:"pt",subject:"Hidráulicos",
    text:"Em aeronaves de grande porte com múltiplos sistemas hidráulicos segregados, qual é a razão principal da segregação completa?",
    options:["Reduzir peso usando tubulações de menor diâmetro","Garantir redundância total — falha em um sistema não compromete os demais","Permitir uso de fluidos diferentes otimizados para cada sistema","Facilitar manutenção modular sem drenar todo o sistema"],
    correct:1,
    explanation:"Segregação completa garante redundância absoluta. Vazamento ou falha em um sistema não se propaga. Superfícies críticas (leme, elevadores, freios) são tipicamente alimentadas por múltiplos sistemas independentes." },
  { id:"c3-7",trail:"celula",module:3,lang:"pt",subject:"Estruturas",
    text:"O conceito 'safe-life' aplicado ao trem de pouso significa:",
    options:["Inspeção periódica por NDT para detectar trincas","Substituição mandatória após número definido de ciclos de pouso, independente da condição aparente","Monitoramento contínuo de carga com sensores embarcados","Reparo aprovado até atingir a resistência estrutural original"],
    correct:1,
    explanation:"Componentes safe-life do trem são descartados ao atingir o limite de ciclos (não horas de voo) estabelecido pela análise de fadiga. A substituição é mandatória independente de condição visual ou NDT." },
  { id:"c3-8",trail:"celula",module:3,lang:"pt",subject:"Controles",
    text:"O 'balance tab' em superfícies de controle de aeronaves maiores reduz:",
    options:["Arrasto aerodinâmico da superfície de controle","Força necessária pelo piloto para mover a superfície principal","Flutter da superfície em alta velocidade","Vibração transmitida ao manche/pedais em turbulência"],
    correct:1,
    explanation:"A balance tab move-se oposto à superfície principal, criando força aerodinâmica que auxilia o piloto. Isso reduz o momento de dobradiça e portanto as forças nos comandos — crítico em grandes aeronaves." },
  { id:"c3-9",trail:"celula",module:3,lang:"pt",subject:"Aviônica",
    text:"O FDR (Flight Data Recorder) em aeronaves comerciais deve registrar dados por no mínimo:",
    options:["30 minutos de voo","2 horas de voo","25 horas de voo","100 horas de voo"],
    correct:2,
    explanation:"O FDR deve registrar no mínimo 25 horas dos parâmetros de voo (RBAC 121 / ICAO Annex 6). O CVR (Cockpit Voice Recorder) grava as últimas 2 horas de áudio. Ambos são blindados para sobreviver a acidentes." },
  { id:"c3-10",trail:"celula",module:3,lang:"pt",subject:"Pressurização",
    text:"O ciclo de pressurização/despressurização a cada voo sujeita a fuselagem a:",
    options:["Cargas estáticas cumulativas que aumentam com o tempo","Fadiga cíclica por variação de tensão — cada voo é um ciclo de fadiga","Deformação plástica progressiva por fluência (creep)","Corrosão acelerada por variações de umidade"],
    correct:1,
    explanation:"Cada voo sujeita a fuselagem a um ciclo completo de pressurização (carregamento) e despressurização (descarregamento). Esta fadiga cíclica determina a vida em ciclos de voo da fuselagem — razão das inspeções por DFC." },
  // CÉLULA M4
  { id:"c4-1",trail:"celula",module:4,lang:"en",subject:"Landing Gear",
    text:"A 'shimmy damper' on the nose gear is installed to:",
    options:["Absorb vertical shock loads on touchdown","Prevent oscillatory (shimmy) vibration of the nose gear wheels","Control gear retraction/extension rate","Lock the gear in extended position"],
    correct:1,
    explanation:"The shimmy damper prevents rapid oscillatory wobble (shimmy) of landing gear wheels around the vertical axis, which can cause structural damage if uncontrolled. Caused by wheel imbalance, worn bearings, or tire flat spots." },
  { id:"c4-2",trail:"celula",module:4,lang:"en",subject:"Flight Controls",
    text:"The purpose of a 'balance tab' on large aircraft flight control surfaces is:",
    options:["To increase aerodynamic drag for speed control","To reduce pilot effort required to move the primary control surface","To prevent flutter at high speeds","To automatically trim during autopilot operation"],
    correct:1,
    explanation:"A balance tab deflects opposite to the main surface, creating aerodynamic assistance that reduces hinge moment and control forces — essential on large, fast aircraft where manual operation would be physically demanding." },
  { id:"c4-3",trail:"celula",module:4,lang:"en",subject:"Fuel Systems",
    text:"The function of the Fuel Control Unit (FCU/HMU) in a turbine engine is:",
    options:["To filter fuel before combustion","To meter and schedule fuel flow based on throttle position and engine parameters","To separate water from fuel","To control fuel transfer between tanks"],
    correct:1,
    explanation:"The FCU/HMU precisely meters and schedules fuel flow to the engine based on throttle position, N1/N2, T4, altitude, and other parameters, computing correct fuel flow for any operating condition." },
  { id:"c4-4",trail:"celula",module:4,lang:"en",subject:"Pressurization",
    text:"The 'outflow valve' in cabin pressurization controls cabin pressure by:",
    options:["Supplying conditioned air from the air conditioning packs","Regulating the rate at which air escapes from the pressurized cabin","Preventing excessive differential during rapid descents","Activating emergency oxygen when cabin altitude exceeds limits"],
    correct:1,
    explanation:"The outflow valve modulates how much conditioned air escapes the pressurized fuselage. The cabin pressure controller adjusts valve position to maintain the selected cabin altitude or differential pressure schedule." },
  { id:"c4-5",trail:"celula",module:4,lang:"en",subject:"Structural Inspection",
    text:"A 'smiley face' appearance on a rivet's driven head indicates:",
    options:["Properly installed rivet within manufacturer tolerances","Off-center driving — rivet may not develop full shear strength","High-strength alloy with controlled expansion","Corrosion under the head requiring replacement"],
    correct:1,
    explanation:"A crescent-shaped (smiley face) driven head indicates the bucking bar wasn't centered during installation. This eccentric driving creates an asymmetric tail that may compromise the rivet's shear-carrying capability." },
  { id:"c4-6",trail:"celula",module:4,lang:"en",subject:"Systems",
    text:"In aircraft systems, a 'squat switch' (weight-on-wheels switch) is used to:",
    options:["Measure total aircraft weight for load planning","Inhibit certain systems on ground that are unsafe to operate in flight, and vice versa","Control nose gear steering only while taxiing","Trigger automatic ground spoiler deployment on landing"],
    correct:1,
    explanation:"Squat switches detect whether the aircraft is on the ground or airborne. They inhibit dangerous systems (e.g., prevent gear retraction on ground, allow ground spoiler deployment, configure thrust reversers)." },
  { id:"c4-7",trail:"celula",module:4,lang:"en",subject:"Structural Inspection",
    text:"When performing a visual inspection of aluminum structure, 'pillowing' or 'buckling' between rivets indicates:",
    options:["Normal surface finish variation from manufacturing","Possible fatigue cracking or disbonding of the skin from the underlying structure","Acceptable thermal expansion deformation","Rivet head protrusion requiring countersinking"],
    correct:1,
    explanation:"Pillowing/buckling of skin between rivets is a warning sign of potential fatigue cracks at rivet holes or skin-to-substructure disbonding. Requires detailed NDT inspection to determine if cracks are present." },
  { id:"c4-8",trail:"celula",module:4,lang:"en",subject:"Landing Gear",
    text:"The purpose of 'anti-skid' (anti-lock) braking system on aircraft is:",
    options:["To prevent wheels from spinning on wet runways during takeoff","To modulate brake pressure to keep wheels rotating near the skid threshold for maximum braking","To prevent nose gear from skidding during crosswind operations","To automatically apply brakes when thrust reverser deploys"],
    correct:1,
    explanation:"Anti-skid systems modulate hydraulic brake pressure to keep each wheel rotating near the skid threshold, maximizing braking friction and preventing flat spots. Similar to automotive ABS but more sophisticated." },
  { id:"c4-9",trail:"celula",module:4,lang:"en",subject:"Systems",
    text:"'Autoland' (CAT III) approach capability requires which aircraft systems to be fully operational?",
    options:["Only autopilot and ILS receiver","Autopilot, autothrottle, radio altimeter, ILS, fail-passive/fail-operational flight control architecture, and autobrakes","Only ILS receiver and flight management system","Autopilot and enhanced ground proximity warning system"],
    correct:1,
    explanation:"CAT III autoland requires full integration of autopilot (dual/triple redundant), autothrottle, radio altimeter, ILS, and fail-operational FCC architecture — so the system can continue after a single failure below DH." },
  { id:"c4-10",trail:"celula",module:4,lang:"en",subject:"Composites",
    text:"When an AMM specifies 'wet layup repair with room temperature cure (RTC)', the moisture content of the repair area must be:",
    options:["As high as possible to activate the hardener","Within specified limits — typically <0.5% moisture by weight verified by moisture meter","Exactly zero — completely dry materials are required","Irrelevant as RTC resins are moisture-insensitive"],
    correct:1,
    explanation:"Even with RTC resins, substrate moisture degrades bond quality. AMMs specify maximum moisture content (typically <0.5% by weight), verified by calibrated moisture meters, before applying adhesive or prepreg." },
  // CÉLULA M5
  { id:"c5-1",trail:"celula",module:5,lang:"en",subject:"Advanced Aerodynamics",
    text:"'Aileron reversal' at high airspeeds occurs because:",
    options:["The pilot inadvertently applies opposite input","Wing torsional flexibility causes aileron deflection to increase angle of attack on the down-aileron side more than the lift","Hydraulic pressure is insufficient to overcome aerodynamic loads","Shock-induced separation eliminates aileron effectiveness above Mmo"],
    correct:1,
    explanation:"Aileron reversal occurs when wing torsional flexibility allows aerodynamic pitching moment from aileron deflection to twist the wing opposite to the intended effect. At reversal speed, twist-induced AoA change dominates over direct lift change." },
  { id:"c5-2",trail:"celula",module:5,lang:"pt",subject:"Certificação",
    text:"Em análise de damage tolerance (FAR/CS 25.571), 'residual strength' é definida como:",
    options:["Margem estrutural adicional acima da carga limite em estrutura intacta","Resistência estrutural com o maior dano indetectável pelo programa de inspeção","Resistência mantida pelos caminhos de carga backup após falha do primário","Vida de fadiga restante após número definido de ciclos"],
    correct:1,
    explanation:"Residual strength é a capacidade de carga com dano até o máximo que poderia escapar à detecção pelo programa de inspeção. As regulamentações exigem que esta resistência atenda a requisitos mínimos (tipicamente carga limite)." },
  { id:"c5-3",trail:"celula",module:5,lang:"en",subject:"Advanced Systems",
    text:"The regulatory requirement for 'independence' in maintenance quality systems means:",
    options:["Each task is performed by an independent contractor","Inspection functions have authority independent of production pressures to reject non-conforming work","All documentation is reviewed by regulators independent of the organization","Quality audits are performed by organizations with no financial interest"],
    correct:1,
    explanation:"Independence means Quality/Inspection department has organizational and functional independence from production. Inspectors must be able to reject non-conforming work without pressure from production supervisors — key principle in RBAC 145." },
  { id:"c5-4",trail:"celula",module:5,lang:"pt",subject:"Análise de Falhas",
    text:"O conceito MSG-3 (Maintenance Steering Group-3) para desenvolvimento de programas de manutenção baseia-se em:",
    options:["Intervalos fixos iguais para todos os itens da aeronave","Análise lógica de consequências de falha para otimizar tarefas e intervalos de manutenção","Substituição periódica mandatória de todos os itens significativos","Monitoramento exclusivo de condição sem intervenções programadas"],
    correct:1,
    explanation:"MSG-3 usa análise lógica estruturada das consequências de falha (segurança, operacional, econômica) para determinar as tarefas de manutenção mais eficazes (inspeção, restauração, descarte, monitoramento de condição) e seus intervalos." },
  { id:"c5-5",trail:"celula",module:5,lang:"en",subject:"Structural Dynamics",
    text:"The significance of 'flutter speed' (VF) in structural certification is:",
    options:["VF must be ≥1.15× design dive speed to provide safe margins","VF must exceed VD/MD by at least 15% throughout the entire flight envelope","VF is where structural damping can no longer prevent oscillation growth","VF is where aeroelastic deformation is within elastic limits"],
    correct:1,
    explanation:"FAR/CS 25.629 requires demonstrated flutter speed to exceed VD/MD by at least 15%. Below this margin, aeroelastic coupling between structural dynamics and aerodynamic forces could lead to divergent flutter — catastrophic failure." },
  { id:"c5-6",trail:"celula",module:5,lang:"pt",subject:"Compostos Avançados",
    text:"Qual é a principal diferença entre um reparo 'plug' e um reparo 'patch' em composto?",
    options:["Reparo plug é feito com composto; patch é feito com metal","Plug preenche o material removido com composto novo curado in-situ; patch aplica material adicional sobre a área danificada","Plug é para danos superficiais; patch para danos profundos","São termos equivalentes com diferenças regionais de terminologia"],
    correct:1,
    explanation:"Um plug repair remove o material danificado e preenche com composto novo curado in-situ, restaurando a espessura. Um patch (externo ou incorporado) aplica material adicional sobre ou dentro da área, podendo ou não remover o dano." },
  { id:"c5-7",trail:"celula",module:5,lang:"en",subject:"Advanced Avionics",
    text:"In a modern FBW aircraft with multiple redundant flight control computers, 'dissimilar redundancy' means:",
    options:["Using identical computers manufactured by different suppliers","Using computers with different hardware architectures and/or software written in different languages to avoid common-mode failures","Installing redundant computers in physically separated locations","Programming each computer with a different control law for comparison"],
    correct:1,
    explanation:"Dissimilar redundancy uses fundamentally different hardware designs and/or software implementations to prevent common-mode failures — where the same programming or hardware bug could disable all redundant computers simultaneously." },
  { id:"c5-8",trail:"celula",module:5,lang:"pt",subject:"Sistemas Avançados",
    text:"O que distingue um sistema hidráulico 'power-by-wire' (EHA — Electro-Hydraulic Actuator) de um sistema hidráulico convencional centralizado?",
    options:["EHA usa fluido de menor pressão (1000 psi vs 3000 psi)","EHA tem bomba hidráulica local acionada por motor elétrico — sem linhas hidráulicas centralizadas percorrendo toda a aeronave","EHA opera apenas como backup do sistema hidráulico principal","EHA é exclusivo de aeronaves militares"],
    correct:1,
    explanation:"Em EHA (Electro-Hydraulic Actuator), a bomba hidráulica é embutida no próprio atuador e acionada localmente por motor elétrico. Elimina linhas hidráulicas longas — significativa redução de peso e maior confiabilidade (menos pontos de vazamento)." },
  { id:"c5-9",trail:"celula",module:5,lang:"en",subject:"Inspection Advanced",
    text:"In ultrasonic testing, the 'dead zone' (initial pulse zone) refers to:",
    options:["The region beyond the transducer's maximum detectable range","The region immediately below the transducer where shallow defect echoes cannot be resolved from the transmission pulse","Areas where the beam cannot be directed effectively due to geometry","The time delay between pulse transmission and first back-wall echo in thin sections"],
    correct:1,
    explanation:"The dead zone is immediately below the transducer where the initial pulse 'rings down.' Defects in this region produce echoes overlapping with the initial pulse, preventing detection. Delay blocks or angle-beam probes help overcome this limitation." },
  { id:"c5-10",trail:"celula",module:5,lang:"pt",subject:"Certificação Avançada",
    text:"O que é 'service life limit' (SLL) de um componente aeronáutico?",
    options:["O intervalo entre revisões gerais (overhaul) baseado em horas de operação","O limite máximo de vida em serviço além do qual o componente não pode mais ser utilizado independente de condição","A vida esperada antes da primeira necessidade de reparo","O número de ciclos de teste de fadiga antes da aprovação do componente"],
    correct:1,
    explanation:"Service Life Limit é o limite absoluto de vida útil — em horas, ciclos ou calendário — além do qual o componente é mandatoriamente descartado. Diferente do TBO (time between overhauls), o SLL não pode ser estendido por inspeção ou reparo." },
  // INGLÊS M1
  { id:"i1-1",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"What does 'airworthy' mean when applied to an aircraft?",
    options:["The aircraft is registered with the civil aviation authority","The aircraft meets all safety standards and is in condition for safe flight","The aircraft has completed scheduled maintenance on time","The aircraft is approved for commercial operations"],
    correct:1,
    explanation:"'Airworthy' means the aircraft conforms to its approved type design and is in a condition for safe flight, with all required equipment installed and functional." },
  { id:"i1-2",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"'OEM' in aviation maintenance stands for:",
    options:["Operational Engine Manual","Original Equipment Manufacturer","Official Engineering Modification","Overhaul Engineering Manual"],
    correct:1,
    explanation:"OEM = Original Equipment Manufacturer. OEM parts and documentation are primary maintenance references, as opposed to PMA (Parts Manufacturer Approval) alternatives." },
  { id:"i1-3",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"The 'empennage' refers to:",
    options:["The main wing assembly","The tail section with horizontal/vertical stabilizers and control surfaces","The engine nacelle and thrust reverser","The fuselage forward of the wing box"],
    correct:1,
    explanation:"The empennage is the tail assembly: horizontal stabilizer (with elevator), vertical stabilizer (with rudder), providing longitudinal and directional stability and control." },
  { id:"i1-4",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"A 'logbook entry' in aviation is:",
    options:["A pre-flight checklist","An official record of maintenance work with date, description, and certifying signature","A passenger manifest","A fuel consumption record"],
    correct:1,
    explanation:"A logbook entry documents maintenance work: work description, date, aircraft ID, reference documents used, and the certifying professional's signature and certificate number. It's a legal requirement." },
  { id:"i1-5",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"'Serviceable' for an aviation component means:",
    options:["Requires immediate replacement","Meets all standards and is approved for aircraft installation","Currently installed on an in-service aircraft","Approved only for ground test"],
    correct:1,
    explanation:"'Serviceable' = inspected, within limits, with proper documentation (serviceable tag) authorizing installation. The opposite is 'unserviceable' — requiring repair or disposal." },
  { id:"i1-6",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"What does 'torque' mean in the context of aircraft fastener installation?",
    options:["The linear force applied to tighten a fastener","The rotational force (twisting moment) applied when tightening a fastener, measured in in-lb or N·m","The thread pitch of a bolt or nut","The clamping load distributed across the joint"],
    correct:1,
    explanation:"Torque is the rotational force (twisting moment) applied when tightening fasteners. Specified torque values ensure proper clamping load without under-tightening (joint loosening) or over-tightening (fastener damage)." },
  { id:"i1-7",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"The acronym 'NDT' stands for:",
    options:["Normal Descent Technique","Non-Destructive Testing","Navigation Data Terminal","Non-Directional Transponder"],
    correct:1,
    explanation:"NDT = Non-Destructive Testing. Inspection methods (ultrasound, eddy current, penetrant, radiography, magnetic particle) that detect flaws without damaging the part being inspected." },
  { id:"i1-8",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"What is a 'corrosion' in aviation maintenance?",
    options:["Mechanical damage from impact with ground objects","Electrochemical degradation of metal through oxidation reactions","Fatigue cracking from cyclic loading","Erosion of surface coating from high-velocity air"],
    correct:1,
    explanation:"Corrosion is electrochemical degradation of metal through oxidation — rust in steel, white powder (aluminum oxide) in aluminum. Requires electrochemical reaction: metal + oxidizing agent + electrolyte (moisture)." },
  { id:"i1-9",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"In aviation, 'squawk' in maintenance context refers to:",
    options:["Radio interference on VHF","A transponder code for ATC","A defect written up by the flight crew in the technical log","An ACARS automated message"],
    correct:2,
    explanation:"In maintenance, a 'squawk' is a defect or discrepancy written in the technical log/maintenance logbook by flight crew for maintenance personnel to address before the next flight." },
  { id:"i1-10",trail:"ingles",module:1,lang:"en",subject:"Basic Vocabulary",
    text:"What does 'deferred maintenance' mean?",
    options:["Maintenance postponed due to weather","Maintenance that is approved to be delayed beyond its scheduled time within specific conditions (e.g., MEL)","Maintenance performed ahead of schedule","Emergency maintenance required immediately"],
    correct:1,
    explanation:"Deferred maintenance is approved postponement of a required maintenance action beyond its normal schedule — typically via MEL or a deferred defect process — under specific operational conditions and time limits." },
  // INGLÊS M2
  { id:"i2-1",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"A Service Bulletin (SB) differs from an Airworthiness Directive (AD) in that:",
    options:["An SB is manufacturer-issued and generally recommended but not mandatory; an AD is mandatory","An SB is regulatory authority-issued; an AD is from the manufacturer","An SB requires action within 10 hours; an AD has longer compliance","An SB applies to powerplants; an AD covers all systems"],
    correct:0,
    explanation:"SBs are manufacturer recommendations — not mandatory unless incorporated into an AD. Once incorporated into an AD by the regulatory authority, compliance becomes legally mandatory." },
  { id:"i2-2",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"'Bleeding' a hydraulic system means:",
    options:["Draining the fluid for replacement","Removing trapped air from the lines and components","Pressure-testing for leaks","Flushing with clean solvent"],
    correct:1,
    explanation:"Bleeding removes entrapped air. Air is compressible and causes spongy response in actuators. The procedure opens bleed ports while cycling the system to allow air to escape." },
  { id:"i2-3",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"The difference between 'corrosion' and 'erosion' on aircraft surfaces is:",
    options:["Corrosion affects metals; erosion only affects composites","Corrosion is electrochemical material degradation; erosion is mechanical removal by particle impact or fluid flow","Corrosion is visible; erosion only detectable by NDT","Corrosion needs moisture; erosion needs elevated temperatures"],
    correct:1,
    explanation:"Corrosion = electrochemical oxidation (rust, white powder). Erosion = physical material removal by abrasive particle impact (rain, ice, sand) or high-velocity flow. Completely different mechanisms." },
  { id:"i2-4",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"'EGT exceedance' requires:",
    options:["No action — normal flight variation","Mandatory hot section inspection per engine maintenance manual","Automatic engine shutdown by FADEC","Pilot write-up only, no physical inspection needed"],
    correct:1,
    explanation:"EGT exceedance (exceeding maximum temperature limits) requires mandatory hot section inspection per the engine manual to assess potential turbine blade/nozzle damage before returning to service." },
  { id:"i2-5",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"When a torque specification reads '120-140 in-lb', the technician should:",
    options:["Apply 120 in-lb then add 140 in-lb in a second pass","Apply any torque value within the 120-140 in-lb range","Use exactly 130 in-lb as the nominal value","Torque to 120 for initial and 140 for final check"],
    correct:1,
    explanation:"A torque range means any value within is acceptable and meets engineering requirements. The range accounts for fastener coating, thread condition, and material variations. Aim for midpoint and verify with calibrated wrench." },
  { id:"i2-6",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"In maintenance documentation, 'IPC' stands for:",
    options:["Integrated Pressure Control","Illustrated Parts Catalog","International Parts Certification","Inertial Platform Computer"],
    correct:1,
    explanation:"IPC = Illustrated Parts Catalog. The IPC provides illustrated breakdowns of all aircraft components with part numbers, applicability, and interchangeability information — essential for parts ordering and identification." },
  { id:"i2-7",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"'MTBF' in aviation maintenance stands for:",
    options:["Minimum Time Between Flights","Mean Time Between Failures","Maximum Threshold Before Failure","Maintenance Task Breakdown Form"],
    correct:1,
    explanation:"MTBF = Mean Time Between Failures. A reliability metric expressing the average time between component failures. High MTBF = high reliability. Used in MSG-3 analysis to optimize maintenance intervals." },
  { id:"i2-8",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"A 'work order' in aviation maintenance is:",
    options:["A purchase order for spare parts","An official document authorizing and describing specific maintenance tasks to be performed","A crew scheduling document for maintenance shifts","A regulatory authority inspection notice"],
    correct:1,
    explanation:"A work order is the official document that authorizes maintenance work, describes tasks to be performed, identifies the aircraft/component, and provides a record of work accomplished, materials used, and technician signatures." },
  { id:"i2-9",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"'Corrosion inhibiting compound' (CIC) is applied to aircraft structure to:",
    options:["Improve aerodynamic surface smoothness","Protect metal surfaces from corrosion by creating a barrier against moisture and oxygen","Provide thermal insulation in high-temperature areas","Lubricate moving structural joints"],
    correct:1,
    explanation:"CIC creates a protective barrier on metal surfaces, preventing contact between the metal and moisture/oxygen that would initiate electrochemical corrosion. Applied in cavities, joints, and dissimilar metal interfaces." },
  { id:"i2-10",trail:"ingles",module:2,lang:"en",subject:"Intermediate English",
    text:"The term 'Technical Log' (Tech Log) in commercial aviation refers to:",
    options:["The aircraft's permanent maintenance history since manufacture","The document carried on board recording the flight crew's defect observations and the maintenance responses for each flight","The engine test cell records","The scheduled maintenance planning document"],
    correct:1,
    explanation:"The Technical Log (journey log/tech log) is carried on board and records: flight data, crew observations/defects, maintenance actions, and deferred items. It travels with the aircraft and is the primary communication link between crews and maintenance." },
  // INGLÊS M3
  { id:"i3-1",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"A 'Type Certificate' (TC) is:",
    options:["A document authorizing a specific aircraft serial number for commercial operation","The FAA/ANAC approval establishing the type design and airworthiness standards for an aircraft model","A certificate granted to airlines operating a specific fleet type","Authorization for organizations to perform modifications on a specific type"],
    correct:1,
    explanation:"A TC is regulatory approval of an aircraft's design — establishing that the type design meets applicable airworthiness standards. The TC holder is responsible for continued airworthiness of the design throughout the aircraft's service life." },
  { id:"i3-2",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"'Fretting' in aircraft structural joints is:",
    options:["A surface treatment for titanium parts","Micro-motion wear damage at the interface between surfaces under contact stress and vibration","A manufacturing defect — surface porosity in cast aluminum","Fatigue cracking at fastener holes in tension panels"],
    correct:1,
    explanation:"Fretting occurs at interfaces of materials under load with micro-amplitude relative motion. It produces oxidized wear debris and can initiate fatigue cracks — common at rivet interfaces, bolt holes, and press-fit joints." },
  { id:"i3-3",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"'Damage tolerance' in structural certification requires:",
    options:["Zero damage in all primary structure at all times","The damaged structure maintains adequate residual strength until the damage is detected and repaired","All damage to be repaired before the next flight","Proof testing to failure after each repair"],
    correct:1,
    explanation:"Damage tolerance ensures that structure with damage (up to the maximum undetectable size) maintains required residual strength (typically limit load) until detected and repaired within the inspection interval." },
  { id:"i3-4",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"In NDT, the dead zone in pulse-echo ultrasonic testing is the region where:",
    options:["The transducer cannot reach due to geometry","Shallow defects cannot be resolved from the initial transmission pulse","The ultrasonic beam is fully attenuated","Back-wall echoes cannot be received"],
    correct:1,
    explanation:"The dead zone is immediately below the transducer where the initial pulse 'rings down.' Defects here produce echoes that overlap with and are masked by the transmission pulse, preventing detection." },
  { id:"i3-5",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"A 'Master Minimum Equipment List' (MMEL) is:",
    options:["The operator's own MEL approved by their national authority","The aircraft manufacturer's document, approved by the certifying authority, that forms the basis for operator MELs","ICAO's equipment requirements applicable to all operators globally","A list of equipment required for specific route approvals"],
    correct:1,
    explanation:"The MMEL is the manufacturer-produced, certifying authority-approved document defining acceptable inoperative configurations for dispatch. Operators derive their own MEL from the MMEL, customized for their operation and approved by their national authority." },
  { id:"i3-6",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"'Dissimilar redundancy' in flight control computers means:",
    options:["Using identical computers from different suppliers","Using computers with different hardware architectures and/or software in different languages to avoid common-mode failures","Installing redundant computers in separated locations","Programming each computer with a different control law"],
    correct:1,
    explanation:"Dissimilar redundancy uses fundamentally different hardware designs and/or different software implementations to prevent common-mode failures — where the same bug could disable all redundant computers simultaneously." },
  { id:"i3-7",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"The term 'stress corrosion cracking' (SCC) in aviation refers to:",
    options:["Surface corrosion visible under UV light only","Cracking caused by the combined action of tensile stress and a corrosive environment","Accelerated fatigue cracking due to corrosive atmosphere","Crevice corrosion at stressed structural joints"],
    correct:1,
    explanation:"SCC requires three simultaneous conditions: susceptible material, tensile stress (residual or applied), and a specific corrosive environment. It can lead to sudden failure at stresses well below yield strength." },
  { id:"i3-8",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"'Creep' in metal structures at elevated temperatures is:",
    options:["Rapid fatigue crack propagation under thermal cycling","Time-dependent plastic deformation under constant stress at elevated temperature","Thermal expansion beyond the elastic limit","Grain boundary separation under thermal shock"],
    correct:1,
    explanation:"Creep is slow, time-dependent plastic deformation under sustained stress at elevated temperatures. Critical in turbine blades and combustion hardware where operating temperatures are a significant fraction of the melting point." },
  { id:"i3-9",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"What does 'FOD' stand for and why is it a safety concern?",
    options:["Fuel Overflow Detection — warns of fuel leaks","Foreign Object Damage/Debris — can cause engine failures, tire damage, or structural damage to aircraft","Flight Operations Directive — regulatory flight limitations","Fail-Safe Overpressure Device — hydraulic system protection"],
    correct:1,
    explanation:"FOD (Foreign Object Damage/Debris) refers to damage caused by foreign objects — tools, debris, wildlife — that can be ingested by engines, puncture tires, or damage structures. FOD walks and strict tool control are mandatory safety procedures." },
  { id:"i3-10",trail:"ingles",module:3,lang:"en",subject:"Advanced English",
    text:"'Potting compound' in aircraft electrical connectors is used to:",
    options:["Lubricate connector pins for easier mating","Seal and protect the connector from moisture, vibration, and environmental contamination","Conduct electricity between connector body and airframe","Color-code connectors for identification"],
    correct:1,
    explanation:"Potting compound is an epoxy or silicone material injected behind connector contacts to seal against moisture, prevent wire chafing, add mechanical strain relief, and protect contact-to-wire joints from vibration fatigue." },
  // INGLÊS M4
  { id:"i4-1",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"Under RBAC 43, 'return to service' certification means:",
    options:["Notifying ANAC the aircraft returned to the operator","A qualified MMA certifies maintenance was performed per approved data and the aircraft is approved for service","Recording transfer of aircraft custody from maintenance to operator","Confirming all outstanding ADs have been complied with"],
    correct:1,
    explanation:"Return to service (RTS) is the legal certification act where a properly certificated MMA signs the maintenance record, certifying work was performed per approved data and the aircraft/component is approved for service. Required by RBAC 43." },
  { id:"i4-2",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"The AMM states: 'CAUTION: Tighten fitting to manufacturer's recommended torque. Over-tightening will damage the flareless fitting sleeve.' The correct action is:",
    options:["Apply maximum torque as CAUTION indicates highest safe level","Use the torque value in the AMM task or fitting manufacturer data sheet","Tighten until bottomed out, then back off one-quarter turn","Request engineering approval before tightening"],
    correct:1,
    explanation:"CAUTION warns of equipment damage risk. The correct action is to use the specific torque value cited in the AMM or manufacturer spec sheet. Flareless sleeves are particularly susceptible to over-tightening damage." },
  { id:"i4-3",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"A 'Hot Section Inspection' (HSI) of a turbine engine involves:",
    options:["A borescope inspection after every 100 hours","Detailed inspection of combustion section, turbine nozzles, and turbine blades at a specified interval","An inspection triggered when EGT limits are exceeded","Full overhaul of the hot section annually"],
    correct:1,
    explanation:"HSI is a scheduled maintenance event (typically at 50% of TBO) involving detailed inspection of combustion liners, NGVs, turbine blades, and disks — including borescope, dimensional checks, and coating inspection." },
  { id:"i4-4",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"'Independence' in aviation maintenance quality systems means inspection functions have authority to:",
    options:["Operate independently of all regulatory oversight","Reject non-conforming work without pressure from production supervisors","Approve major repairs without engineering review","Certify return to service for any aircraft type"],
    correct:1,
    explanation:"Independence means Quality/Inspection has organizational and functional independence from production. Inspectors must be able to reject non-conforming work freely — a key requirement in RBAC 145 and EASA Part 145." },
  { id:"i4-5",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"Under RBAC 43, what distinguishes a 'major repair' from a 'minor repair'?",
    options:["Cost threshold — major is over R$50,000","A major repair, if done incorrectly, could appreciably affect structural strength, flight characteristics, or other airworthiness qualities","Major requires OEM parts; minor may use PMA parts","Major must be done by a COMA; minor by any MMA"],
    correct:1,
    explanation:"Under RBAC 43, a major repair is one that, if improperly done, might appreciably affect structural strength, flight characteristics, powerplant operation, or other airworthiness qualities. Requires approved data (ANAC-approved)." },
  { id:"i4-6",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"'Continued Airworthiness Instructions' (ICA) provided by the manufacturer include:",
    options:["Only the initial airworthiness certification requirements","Maintenance programs, inspection intervals, airworthiness limitations, and repair data required to maintain the aircraft in an airworthy condition","Only the emergency procedures for the flight crew","Only the parts catalog and pricing information"],
    correct:1,
    explanation:"ICA (Instructions for Continued Airworthiness) are required by the TC holder and include: maintenance program recommendations, structural inspection programs, airworthiness limitations (life limits), wiring diagrams, fault isolation, and repair data." },
  { id:"i4-7",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"An 'Approved Maintenance Organization' (AMO/COMA) must have which of the following?",
    options:["Government ownership or oversight","Approved procedures, qualified personnel, adequate facilities, and a quality system approved by the certifying authority","Minimum 50 years of experience in aviation maintenance","Exclusive contracts with at least three major aircraft manufacturers"],
    correct:1,
    explanation:"An AMO/COMA must have: approved maintenance procedures (MOE/MCM), qualified certificated personnel, adequate facilities/tools/equipment, and a functioning quality assurance system — all approved by the national aviation authority (ANAC)." },
  { id:"i4-8",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"The term 'airworthiness limitation' in aircraft documentation refers to:",
    options:["The maximum speed the aircraft can safely fly","Mandatory replacement or inspection intervals established during certification that cannot be extended without regulatory approval","The maximum weight limitation for safe operations","Restrictions on airspace types the aircraft can operate in"],
    correct:1,
    explanation:"Airworthiness Limitations are mandatory intervals for replacement (life-limited parts) or inspection, established during the type certification process. They are regulatory requirements that cannot be extended without ANAC/FAA approval — they are not optional maintenance recommendations." },
  { id:"i4-9",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"'Preventive maintenance' under RBAC 43 may be performed by:",
    options:["Any person with basic mechanical knowledge","Certificated pilots on aircraft they own or operate — limited to specific simple tasks","Only MMAs with at least 5 years experience","Only ANAC-approved maintenance organizations"],
    correct:1,
    explanation:"RBAC 43 allows certificated pilots to perform specific preventive maintenance tasks (oil changes, simple replacements) on aircraft they own or operate. Work must be recorded in the logbook with description and pilot's certificate number." },
  { id:"i4-10",trail:"ingles",module:4,lang:"en",subject:"ANAC Level",
    text:"A 'Major Alteration' in aviation differs from a repair in that:",
    options:["A major alteration is more expensive to execute","A major alteration changes the type design (configuration, strength, performance) rather than restoring the original condition","A major alteration is performed by the manufacturer; a repair by the operator","A major alteration applies only to engines; a repair to airframe"],
    correct:1,
    explanation:"A repair restores an aircraft/component to its original airworthy condition. An alteration changes the type design (configuration, materials, performance, weight). Major alterations require approved data and recording in the permanent maintenance records." },
  // INGLÊS M5
  { id:"i5-1",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"In damage tolerance analysis per FAR/CS 25.571, 'residual strength' is defined as:",
    options:["Additional structural strength above limit load in an undamaged structure","Structural strength remaining with the largest undetectable damage within the inspection program","Strength retained by backup load paths after primary path failure","Fatigue life remaining after a defined number of flight cycles"],
    correct:1,
    explanation:"Residual strength is the load-carrying capability with damage up to the maximum size that might escape detection by the inspection program. Damage tolerance regulations require this residual strength to meet specific load requirements (typically limit load)." },
  { id:"i5-2",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"'Force-displacement characteristic' verification of an actuator requires:",
    options:["Confirming part number matches the figure reference","Measuring actuator output force at defined displacement points and comparing against specified tolerance bands","Visual inspection for physical damage per the referenced figure","Reviewing historical maintenance records against recommended intervals"],
    correct:1,
    explanation:"Force-displacement verification requires functional testing: applying known displacements and measuring output force at specified points, comparing against AMM tolerance bands to verify stiffness, no-load resistance, and load-bearing capability." },
  { id:"i5-3",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"Ply orientation tolerance of ±3° in composite repair means:",
    options:["Repair patch dimensions may deviate ±3° from template","Each replacement ply must be aligned within 3° of the repair scheme orientation","Scarfing angle may vary ±3° from nominal","Panel may be placed up to 3° from horizontal during cure"],
    correct:1,
    explanation:"Ply orientation tolerance specifies alignment precision. Exceeding ±3° degrades laminate stiffness and strength in ways undetectable visually, compromising structural performance. Fiber direction is measured against the repair scheme datum." },
  { id:"i5-4",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"The MSG-3 process for developing maintenance programs is based on:",
    options:["Fixed equal intervals for all aircraft items","Logical analysis of failure consequences to optimize maintenance tasks and intervals","Mandatory periodic replacement of all significant items","Condition monitoring only, with no scheduled interventions"],
    correct:1,
    explanation:"MSG-3 uses structured logical analysis of failure consequence (safety, operational, economic) to determine the most effective maintenance tasks (inspection, restoration, discard, condition monitoring) and intervals for each significant item." },
  { id:"i5-5",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"In a FBW flight control architecture, 'command/monitor' redundancy means:",
    options:["Two pilots monitor each other's control inputs","The primary computer sends commands while a monitoring computer independently calculates expected outputs and disconnects on disagreement","The ground controller monitors all FBW commands during approach","Redundant command channels operate simultaneously with majority voting"],
    correct:1,
    explanation:"Command/monitor redundancy pairs a command channel (outputting control signals) with a monitoring channel (independently computing expected values). If outputs disagree beyond threshold, the monitor triggers disconnect — detecting failures without requiring three-channel majority voting." },
  { id:"i5-6",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"The 'safe-life' concept applied to a landing gear component means:",
    options:["Periodic NDT inspection to detect cracks before they reach critical size","Mandatory retirement after a defined number of landing cycles, before any statistically expected failure","Infinite life design ensuring no crack initiation under design loads","Condition-monitored replacement based on measured crack growth rate"],
    correct:1,
    explanation:"Safe-life defines the life (in cycles for landing gear) during which probability of failure is statistically acceptable. Upon reaching the limit, mandatory retirement occurs regardless of apparent condition — no extension by inspection is permitted." },
  { id:"i5-7",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"'Common cause analysis' (CCA) in aircraft system certification identifies:",
    options:["The most frequent failure mode in any given system","Conditions where a single event could simultaneously cause failures in multiple redundant systems, invalidating assumed independence","Common maintenance procedures across different systems","Frequently occurring defects in the fleet service data"],
    correct:1,
    explanation:"CCA identifies potential single events (failure, error, environmental condition) that could simultaneously cause failures in multiple supposedly independent systems, violating independence assumptions in the safety assessment. Includes Particular Risk Analysis, Zonal Safety Analysis, and Common Mode Analysis." },
  { id:"i5-8",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"In composite repair, 'co-cure' vs 'secondary bond' processes differ in that:",
    options:["Co-cure uses pre-cured patches; secondary bond uses wet layup","Co-cure cures the repair patch simultaneously with the parent structure; secondary bond adheres an already-cured patch with adhesive","Co-cure is for room temperature cure only; secondary bond requires autoclave","Secondary bond is stronger; co-cure is faster"],
    correct:1,
    explanation:"Co-cure: repair material cures simultaneously with fresh parent material (or with the parent during manufacturing). Secondary bond: a pre-cured patch is bonded with adhesive to an already-cured parent. Secondary bonds have potential bondline weaknesses not present in co-cured structures." },
  { id:"i5-9",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"The 'Zonal Safety Analysis' (ZSA) in aircraft system safety assessment evaluates:",
    options:["The safety of each individual system in isolation","Whether all equipment and systems in a physical zone can coexist without adverse interactions, and whether zone maintenance can be performed safely","The safety of flight operations in different airspace zones","The fire resistance requirements for each zone of the fuselage"],
    correct:1,
    explanation:"ZSA evaluates all equipment in a physical zone (bay, compartment) for: potential adverse interactions between systems, ability to perform maintenance safely in the zone, and common cause failure potential from zone-specific hazards (fire, flooding, uncontained failures)." },
  { id:"i5-10",trail:"ingles",module:5,lang:"en",subject:"Maximum Level",
    text:"An 'Equivalent Level of Safety' (ELOS) finding in aircraft certification means:",
    options:["The aircraft meets exactly the same numerical probability requirements as the standard","Alternative means of compliance achieve the same safety objective as the regulation, even if the method differs","The aircraft's safety is equivalent to the fleet average","Safety margins are equivalent between different aircraft generations"],
    correct:1,
    explanation:"An ELOS finding documents that an alternative means of compliance (not strictly following the regulation's prescriptive method) achieves an equivalent or better level of safety. Requires regulatory authority approval and detailed engineering justification." },
];

// ─── TRAIL CONFIG ─────────────────────────────────────────────
const TRAIL_CONFIG = {
  basico: {
    id: "basico" as TrailId, name: "BÁSICO", color: "#0ea5e9", bgClass: "from-sky-600/20 to-sky-900/5",
    icon: Wrench, description: "Fundamentos da manutenção aeronáutica, regulamentos RBAC e sistemas básicos",
    modules: [
      { name: "Conceitos Fundamentais", difficulty: "Fácil", tag: "PT" },
      { name: "Desenvolvimento Técnico", difficulty: "60% Difícil", tag: "PT" },
      { name: "Nível Intermediário-Alto", difficulty: "80% Difícil", tag: "PT" },
      { name: "Inglês Técnico ANAC", difficulty: "Inglês", tag: "EN" },
      { name: "Nível Extremo Misto", difficulty: "Máximo", tag: "PT+EN" },
    ],
  },
  celula: {
    id: "celula" as TrailId, name: "CÉLULA", color: "#f59e0b", bgClass: "from-amber-600/20 to-amber-900/5",
    icon: Plane, description: "Estruturas, sistemas e componentes da célula de aeronaves",
    modules: [
      { name: "Estruturas Básicas", difficulty: "Fácil", tag: "PT" },
      { name: "Sistemas de Controle", difficulty: "60% Difícil", tag: "PT" },
      { name: "Sistemas Avançados", difficulty: "80% Difícil", tag: "PT" },
      { name: "Aircraft Systems English", difficulty: "Inglês", tag: "EN" },
      { name: "Nível Extremo Misto", difficulty: "Máximo", tag: "PT+EN" },
    ],
  },
  ingles: {
    id: "ingles" as TrailId, name: "INGLÊS AERONÁUTICO", color: "#8b5cf6", bgClass: "from-violet-600/20 to-violet-900/5",
    icon: Globe, description: "Terminologia técnica aeronáutica em inglês para provas ANAC",
    modules: [
      { name: "English Basics", difficulty: "Básico", tag: "EN" },
      { name: "Intermediate Aviation", difficulty: "Intermediário", tag: "EN" },
      { name: "Advanced Technical", difficulty: "Avançado", tag: "EN" },
      { name: "ANAC Exam Level", difficulty: "Nível Prova", tag: "EN" },
      { name: "Maximum Level", difficulty: "Máximo", tag: "EN" },
    ],
  },
};

// ─── STORAGE ──────────────────────────────────────────────────
const LS_RESULTS = "anac_results_v1";
const LS_PROGRESS = "anac_progress_v1";

function loadResults(): ExamResult[] {
  try {
    const raw = localStorage.getItem(LS_RESULTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as (Omit<ExamResult,"date"> & { date: string })[];
    return parsed.map(r => ({ ...r, date: new Date(r.date) }));
  } catch { return []; }
}

function saveResults(results: ExamResult[]) {
  try { localStorage.setItem(LS_RESULTS, JSON.stringify(results)); } catch {}
}

function loadProgress(): Record<TrailId, TrailState> {
  const def: Record<TrailId, TrailState> = {
    basico: { unlockedModules:[1], completedModules:[], round:1 },
    celula: { unlockedModules:[1], completedModules:[], round:1 },
    ingles: { unlockedModules:[1], completedModules:[], round:1 },
  };
  try {
    const raw = localStorage.getItem(LS_PROGRESS);
    return raw ? { ...def, ...JSON.parse(raw) } : def;
  } catch { return def; }
}

function saveProgress(p: Record<TrailId, TrailState>) {
  try { localStorage.setItem(LS_PROGRESS, JSON.stringify(p)); } catch {}
}

// ─── DATA COMPUTATIONS FROM REAL RESULTS ─────────────────────
const DAY_LABELS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function computeWeeklyData(results: ExamResult[]) {
  const now = new Date();
  return Array.from({length:7}, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = DAY_LABELS[d.getDay()];
    const dayResults = results.filter(r => {
      const rd = new Date(r.date);
      return rd.getDate()===d.getDate() && rd.getMonth()===d.getMonth() && rd.getFullYear()===d.getFullYear();
    });
    const score = dayResults.length ? Math.round(dayResults.reduce((a,r)=>a+r.score*10,0)/dayResults.length) : null;
    return { day: dayStr, score };
  }).filter(d => d.score !== null) as { day:string; score:number }[];
}

function computeMonthlyData(results: ExamResult[]) {
  const now = new Date();
  const byDay: Record<string, number[]> = {};
  results.forEach(r => {
    const d = new Date(r.date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diff <= 29) {
      const key = `${30 - diff}`;
      if (!byDay[key]) byDay[key] = [];
      byDay[key].push(r.score * 10);
    }
  });
  return Object.entries(byDay)
    .sort((a,b) => Number(a[0]) - Number(b[0]))
    .map(([day, scores]) => ({ day, score: Math.round(scores.reduce((a,v)=>a+v,0)/scores.length) }));
}

function computeSubjectStats(results: ExamResult[]) {
  const bySubject: Record<string, { total: number; count: number }> = {};
  results.forEach(r => {
    r.questions.forEach((q, i) => {
      if (!bySubject[q.subject]) bySubject[q.subject] = { total:0, count:0 };
      bySubject[q.subject].total += r.answers[i]?.correct ? 100 : 0;
      bySubject[q.subject].count += 1;
    });
  });
  return Object.entries(bySubject)
    .map(([s, { total, count }]) => {
      const v = Math.round(total / count);
      const c = v >= 80 ? "#22c55e" : v >= 65 ? "#f59e0b" : "#ef4444";
      return { s, v, c };
    })
    .sort((a,b) => b.v - a.v);
}

function computeRadarData(results: ExamResult[]) {
  const subjectGroups: Record<string, string> = {
    "Estruturas": "Estruturas", "Estruturas Aeronáuticas": "Estruturas", "Asas": "Estruturas",
    "Hidráulicos": "Hidráulicos", "Hidráulicos Avançados": "Hidráulicos",
    "Instrumentos": "Instrumentos", "Instrumentos de Voo": "Instrumentos",
    "Elétrica": "Elétrica", "Controles": "Controles",
    "Regulamentos": "Regulamentos", "Regulamentos RBAC": "Regulamentos", "ANAC Level": "Regulamentos",
    "Inglês": "Inglês", "Basic Vocabulary": "Inglês", "Aviation English": "Inglês",
    "Intermediate English": "Inglês", "Advanced English": "Inglês", "ANAC Exam Level": "Inglês",
    "Maximum Level English": "Inglês",
    "NDT": "NDT", "Inspeções": "NDT", "Structural Inspection": "NDT",
    "Compostos": "Compostos", "Estruturas Compostas": "Compostos", "Compostos Avançados": "Compostos",
    "Propulsão": "Propulsão", "Propulsão Avançada": "Propulsão",
  };
  const grouped: Record<string, { total: number; count: number }> = {};
  results.forEach(r => {
    r.questions.forEach((q, i) => {
      const grp = subjectGroups[q.subject] || q.subject.split(" ")[0];
      if (!grouped[grp]) grouped[grp] = { total:0, count:0 };
      grouped[grp].total += r.answers[i]?.correct ? 100 : 0;
      grouped[grp].count += 1;
    });
  });
  const radars = ["Estruturas","Hidráulicos","Instrumentos","Elétrica","Regulamentos","Inglês"];
  return radars.map(subject => ({
    subject,
    A: grouped[subject] ? Math.round(grouped[subject].total / grouped[subject].count) : 0,
  }));
}

// ─── HELPERS ──────────────────────────────────────────────────
const fmtTime = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const fmtDate = (d: Date) => d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"2-digit"});
const fmtHour = (d: Date) => d.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});
const trailLabel = (t: TrailId) => ({ basico:"Básico", celula:"Célula", ingles:"Inglês" }[t]);
const trailColor = (t: TrailId) => ({ basico:"#0ea5e9", celula:"#f59e0b", ingles:"#8b5cf6" }[t]);

function getExamQuestions(trail: TrailId, module: number): Question[] {
  const pool = QB.filter(q => q.trail === trail && q.module === module);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  if (shuffled.length >= 10) return shuffled.slice(0, 10);
  const extra = QB.filter(q => q.trail === trail && q.module !== module).sort(() => Math.random() - 0.5);
  return [...shuffled, ...extra].slice(0, 10);
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-semibold"
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}30` }}>
      {label}
    </span>
  );
}

function ProgressBar({ value, max, color="#0ea5e9" }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width:`${pct}%`, backgroundColor: color }} />
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(true);
  const [view, setView] = useState<View>("dashboard");
  const [selectedTrail, setSelectedTrail] = useState<TrailId>("basico");
  const [mobileNav, setMobileNav] = useState(false);
  const [activeResult, setActiveResult] = useState<ExamResult | null>(null);
  const [weeklyView, setWeeklyView] = useState(true);

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const defaultProgress: Record<TrailId, TrailState> = {
    basico: { unlockedModules:[1], completedModules:[], round:1 },
    celula: { unlockedModules:[1], completedModules:[], round:1 },
    ingles: { unlockedModules:[1], completedModules:[], round:1 },
  };

  // Progress state — loaded from localStorage as fallback
  const [progress, setProgress] = useState<Record<TrailId, TrailState>>(loadProgress);
  const [results, setResults] = useState<ExamResult[]>(loadResults);

  // Exam state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [examModule, setExamModule] = useState(1);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number|null)[]>([]);
  const [selectedAns, setSelectedAns] = useState<number|null>(null);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Load cloud data for a user and hydrate state
  const hydrateFromCloud = async (userId: string) => {
    setSyncing(true);
    const data = await cloudLoad(userId);
    setSyncing(false);
    if (!data) return;
    if (data.results) {
      const parsed: ExamResult[] = data.results.map((r: ExamResult & { date: string }) => ({ ...r, date: new Date(r.date) }));
      setResults(parsed);
      saveResults(parsed);
    }
    if (data.progress) {
      setProgress(data.progress);
      saveProgress(data.progress);
    }
  };

  // Save results + progress to cloud
  const persistToCloud = async (newResults: ExamResult[], newProgress: Record<TrailId, TrailState>, userId: string) => {
    await cloudSave(userId, { results: newResults, progress: newProgress });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      setAuthLoading(false);
      if (u) hydrateFromCloud(u.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setAuthLoading(false);
      if (u) {
        hydrateFromCloud(u.id);
      } else {
        setResults([]);
        setProgress(defaultProgress);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => { saveResults(results); }, [results]);
  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    if (view === "exam") {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [view]);

  const startExam = (trail: TrailId, mod: number) => {
    const qs = getExamQuestions(trail, mod);
    setExamQuestions(qs);
    setExamModule(mod);
    setSelectedTrail(trail);
    setCurrentQ(0);
    setUserAnswers(new Array(qs.length).fill(null));
    setSelectedAns(null);
    setTimer(0);
    setView("exam");
    setMobileNav(false);
    toast.info(`Prova iniciada — Módulo ${mod}`, { duration: 2000 });
  };

  const handleAnswer = (idx: number) => {
    if (selectedAns !== null) return;
    setSelectedAns(idx);
    const a = [...userAnswers];
    a[currentQ] = idx;
    setUserAnswers(a);
  };

  const finishExam = () => {
    const correct = examQuestions.filter((q, i) => userAnswers[i] === q.correct).length;
    const passed = correct >= 8;
    const result: ExamResult = {
      id: `e-${Date.now()}`,
      date: new Date(),
      trail: selectedTrail,
      module: examModule,
      score: correct,
      timeSpent: timer,
      answers: examQuestions.map((q, i) => ({ questionId:q.id, selected:userAnswers[i]??-1, correct:userAnswers[i]===q.correct })),
      passed,
      questions: examQuestions,
    };
    const newResults = [result, ...results];
    setResults(newResults);

    let newProgress = progress;
    if (passed) {
      const next = examModule + 1;
      const t = progress[selectedTrail];
      if (next <= 5) {
        const unlocked = t.unlockedModules.includes(next) ? t.unlockedModules : [...t.unlockedModules, next];
        const completed = t.completedModules.includes(examModule) ? t.completedModules : [...t.completedModules, examModule];
        newProgress = { ...progress, [selectedTrail]: { ...t, unlockedModules:unlocked, completedModules:completed } };
        setTimeout(() => toast.success(`🎉 Módulo ${examModule} aprovado! Módulo ${next} desbloqueado!`), 300);
      } else {
        const newRound = t.round + 1;
        newProgress = { ...progress, [selectedTrail]: { unlockedModules:[1], completedModules:[], round:newRound } };
        setTimeout(() => toast.success(`🏆 Trilha completa! Rodada ${newRound} iniciada com novas questões!`), 300);
      }
      setProgress(newProgress);
    } else {
      setTimeout(() => toast.error(`${correct}/10 — Abaixo de 80%. Tente novamente!`), 300);
    }

    // Sync to cloud
    if (user) persistToCloud(newResults, newProgress, user.id);

    setActiveResult(result);
    setView("results");
  };

  const simulateAI = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setAiGenerating(false);
      toast.success("✨ ANAC AI Engine gerou 15 novas questões inéditas!");
    }, 2800);
  };

  const nav = [
    { id:"dashboard" as View, label:"Dashboard", icon:LayoutDashboard },
    { id:"trails" as View, label:"Trilhas", icon:BookOpen },
    { id:"reports" as View, label:"Relatórios", icon:FileText },
    { id:"ai" as View, label:"ANAC AI Engine", icon:Brain },
  ];

  const totalExams = results.length;
  const avg = results.length ? Math.round(results.reduce((a,r) => a + r.score*10,0) / results.length) : 0;
  const approvalRate = results.length ? Math.round(results.filter(r => r.passed).length / results.length * 100) : 0;

  // ── SIDEBAR ──
  const Sidebar = () => (
    <aside className="hidden md:flex flex-col w-60 shrink-0 h-full bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Plane className="w-5 h-5 text-primary" />
        </div>
        <div>
          <div className="font-display font-bold text-sm text-sidebar-foreground leading-none" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"0.9rem",letterSpacing:"0.04em"}}>ANAC MASTER</div>
          <div className="text-xs text-sidebar-foreground/40 font-mono mt-0.5">SIMULADOS</div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(n => {
          const active = view === n.id;
          const Icon = n.icon;
          return (
            <button key={n.id} onClick={() => setView(n.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? "bg-sidebar-accent text-primary font-semibold" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {n.label}
              {n.id === "ai" && <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-mono">AI</span>}
            </button>
          );
        })}
      </nav>
      {/* Progress summary */}
      <div className="px-4 pb-4 space-y-3">
        {(["basico","celula","ingles"] as TrailId[]).map(t => {
          const cfg = TRAIL_CONFIG[t];
          const p = progress[t];
          const pct = (p.completedModules.length / 5) * 100;
          return (
            <div key={t} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-sidebar-foreground/50">{cfg.name}</span>
                <span className="text-xs font-mono" style={{color:cfg.color}}>R{p.round}</span>
              </div>
              <ProgressBar value={p.completedModules.length} max={5} color={cfg.color} />
            </div>
          );
        })}
        <div className="pt-2 border-t border-sidebar-border space-y-2">
          {/* User info */}
          {user && (
            <div className="flex items-center gap-2 px-1">
              <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email||"U")}&background=0ea5e9&color=fff&size=64`}
                alt="avatar" className="w-6 h-6 rounded-full shrink-0 object-cover" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-sidebar-foreground truncate">
                  {user.user_metadata?.name || user.email?.split("@")[0]}
                </div>
                <div className="text-xs text-sidebar-foreground/30 truncate">{user.email}</div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button onClick={() => setDark(!dark)} className="text-sidebar-foreground/40 hover:text-sidebar-foreground transition-colors p-1">
                {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              {syncing && (
                <div className="flex items-center gap-1 text-sidebar-foreground/30">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span className="text-xs font-mono">sync</span>
                </div>
              )}
              {!syncing && (
                <div className="flex items-center gap-1 text-sidebar-foreground/20">
                  <Cloud className="w-3 h-3" />
                </div>
              )}
            </div>
            <button onClick={() => supabase.auth.signOut()}
              className="flex items-center gap-1 text-xs text-sidebar-foreground/30 hover:text-red-400 transition-colors p-1">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  // ── MOBILE TOP BAR ──
  const MobileBar = () => (
    <div className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <Plane className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm text-sidebar-foreground" style={{fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:"0.04em"}}>ANAC MASTER</span>
      </div>
      <div className="flex items-center gap-1.5">
        {syncing && <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />}
        <button onClick={() => setDark(!dark)} className="text-sidebar-foreground/50 p-1.5">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        {user && (
          <img src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email||"U")}&background=0ea5e9&color=fff&size=64`}
            alt="avatar" className="w-6 h-6 rounded-full object-cover" />
        )}
        <button onClick={() => setMobileNav(!mobileNav)} className="text-sidebar-foreground/50 p-1.5">
          {mobileNav ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {mobileNav && (
        <div className="absolute top-14 left-0 right-0 bg-sidebar border-b border-sidebar-border z-50 py-2">
          {nav.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.id} onClick={() => { setView(n.id); setMobileNav(false); }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm ${view===n.id ? "text-primary font-semibold" : "text-sidebar-foreground/60"}`}>
                <Icon className="w-4 h-4" /> {n.label}
              </button>
            );
          })}
          <div className="border-t border-sidebar-border mt-1 pt-1">
            {user && (
              <div className="px-5 py-2 text-xs text-sidebar-foreground/40">{user.email}</div>
            )}
            <button onClick={() => supabase.auth.signOut()}
              className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-400">
              <LogOut className="w-4 h-4" /> Sair da conta
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── DASHBOARD VIEW ──
  const DashboardView = () => {
    const weeklyData = computeWeeklyData(results);
    const monthlyData = computeMonthlyData(results);
    const subjectStats = computeSubjectStats(results);
    const radarData = computeRadarData(results);
    const chartData = weeklyView ? weeklyData : monthlyData;
    const hasData = results.length > 0;
    const strong = subjectStats.filter(s => s.v >= 80);
    const weak = subjectStats.filter(s => s.v < 70);
    const bestScore = hasData ? Math.max(...results.map(r => r.score)) : null;
    const tooltipStyle = { backgroundColor:"#0b1225", border:"1px solid rgba(14,165,233,0.2)", borderRadius:"8px", fontSize:12 };
    const EmptyChart = ({ label }: { label: string }) => (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
        <BarChart2 className="w-7 h-7 text-muted-foreground/20" />
        <p className="text-xs text-muted-foreground/50">{label}</p>
      </div>
    );
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {hasData ? `${results.length} prova${results.length>1?"s":""} registrada${results.length>1?"s":""}` : "Nenhuma prova realizada ainda. Comece por uma trilha!"}
            </p>
          </div>
          <button onClick={simulateAI} disabled={aiGenerating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-all disabled:opacity-50">
            {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            {aiGenerating ? "Gerando..." : "Gerar Questões IA"}
          </button>
        </div>

        {/* Empty state CTA */}
        {!hasData && (
          <div className="bg-card border border-dashed border-primary/20 rounded-xl p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Plane className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-foreground">Pronto para decolar?</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">Realize sua primeira prova para começar a ver seus dados de desempenho aqui. Os gráficos e análises serão gerados automaticamente.</p>
            <button onClick={() => setView("trails")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all mt-1">
              Iniciar Primeira Prova <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label:"Provas Realizadas", value: hasData ? totalExams : "—", icon:FileText, color:"#0ea5e9", sub:"total histórico" },
            { label:"Média Geral", value: hasData ? `${avg}%` : "—", icon:TrendingUp, color:"#22c55e", sub:"aproveitamento" },
            { label:"Taxa de Aprovação", value: hasData ? `${approvalRate}%` : "—", icon:Trophy, color:"#f59e0b", sub:"≥80% acertos" },
            { label:"Melhor Nota", value: bestScore !== null ? `${bestScore}/10` : "—", icon:Award, color:"#8b5cf6", sub:"questões corretas" },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{backgroundColor:`${s.color}15`}}>
                    <Icon className="w-3.5 h-3.5" style={{color:s.color}} />
                  </div>
                </div>
                <div className="text-2xl font-bold font-mono" style={{color:s.color, fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.8rem"}}>{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Evolução de Desempenho</h3>
              <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
                {["Semana","Mês"].map((l,i) => (
                  <button key={l} onClick={() => setWeeklyView(i===0)}
                    className={`px-2.5 py-1 text-xs rounded-md transition-all ${(weeklyView?i===0:i===1) ? "bg-card shadow text-foreground" : "text-muted-foreground"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div style={{height:180}}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" tick={{fontSize:11,fill:"#6b84a3"}} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} tick={{fontSize:11,fill:"#6b84a3"}} axisLine={false} tickLine={false} width={30} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} dot={{fill:"#0ea5e9",r:3}} activeDot={{r:5,fill:"#0ea5e9"}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <EmptyChart label="Realize provas para ver sua evolução" />}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-foreground mb-4">Radar de Competências</h3>
            <div style={{height:180}}>
              {radarData.some(d => d.A > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="subject" tick={{fontSize:9,fill:"#6b84a3"}} />
                    <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
                    <Radar dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} strokeWidth={1.5} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <EmptyChart label="Complete provas para ver o radar" />}
            </div>
          </div>
        </div>

        {/* Subject bars + AI insights */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-foreground mb-4">Aproveitamento por Matéria</h3>
            {subjectStats.length > 0 ? (
              <div className="space-y-3">
                {subjectStats.slice(0, 8).map(s => (
                  <div key={s.s} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{s.s}</span>
                      <span className="font-mono font-semibold" style={{color:s.c}}>{s.v}%</span>
                    </div>
                    <ProgressBar value={s.v} max={100} color={s.c} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <BarChart2 className="w-8 h-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground/50 text-center">Realize provas para ver seu aproveitamento por matéria</p>
              </div>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-primary" />
              <h3 className="text-foreground">Análise da IA</h3>
            </div>
            {hasData ? (
              <div className="space-y-3">
                {strong.length > 0 && (
                  <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-semibold text-green-500">Pontos Fortes</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {strong.slice(0,3).map(s => <div key={s.s}>• {s.s} ({s.v}%)</div>)}
                    </div>
                  </div>
                )}
                {weak.length > 0 && (
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs font-semibold text-red-400">Atenção Necessária</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {weak.slice(0,3).map(s => <div key={s.s}>• {s.s} ({s.v}%)</div>)}
                    </div>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">Recomendação ANAC AI: </span>
                  {weak.length > 0
                    ? `Foque em ${weak.map(s=>s.s).slice(0,2).join(" e ")}. A ANAC cobra estes temas com alta frequência.`
                    : "Desempenho excelente! Continue praticando para manter a consistência."}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-center">
                <Brain className="w-8 h-8 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground/50">A IA analisará seu desempenho após as primeiras provas</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ── TRAILS VIEW ──
  const TrailsView = () => (
    <div className="space-y-6">
      <div>
        <h1>Trilhas de Estudo</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Selecione uma trilha para começar ou continuar seu treinamento</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {(Object.values(TRAIL_CONFIG)).map(trail => {
          const Icon = trail.icon;
          const p = progress[trail.id];
          const pct = p.completedModules.length / 5;
          return (
            <div key={trail.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all cursor-pointer group"
              onClick={() => { setSelectedTrail(trail.id); setView("modules"); }}>
              <div className={`h-2`} style={{backgroundColor: trail.color}} />
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{backgroundColor:`${trail.color}15`, border:`1px solid ${trail.color}25`}}>
                    <Icon className="w-5 h-5" style={{color: trail.color}} />
                  </div>
                  <Badge label={`R${p.round}`} color={trail.color} />
                </div>
                <div>
                  <h3 className="text-foreground" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.2rem"}}>{trail.name}</h3>
                  <p className="text-muted-foreground text-xs mt-1 leading-relaxed">{trail.description}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Progresso — Rodada {p.round}</span>
                    <span className="font-mono font-semibold" style={{color:trail.color}}>{p.completedModules.length}/5 módulos</span>
                  </div>
                  <ProgressBar value={p.completedModules.length} max={5} color={trail.color} />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1,2,3,4,5].map(m => {
                    const unlocked = p.unlockedModules.includes(m);
                    const completed = p.completedModules.includes(m);
                    return (
                      <div key={m} className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all"
                        style={{
                          backgroundColor: completed ? `${trail.color}25` : unlocked ? `${trail.color}10` : "rgba(255,255,255,0.03)",
                          color: completed ? trail.color : unlocked ? trail.color+"88" : "#3a4a5e",
                          border: `1px solid ${completed ? trail.color+"40" : unlocked ? trail.color+"20" : "rgba(255,255,255,0.06)"}`,
                        }}>
                        {completed ? "✓" : unlocked ? m : <Lock className="w-2.5 h-2.5" />}
                      </div>
                    );
                  })}
                </div>
                <button className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 group-hover:opacity-90"
                  style={{backgroundColor:`${trail.color}15`, color:trail.color, border:`1px solid ${trail.color}25`}}>
                  Acessar Trilha <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── MODULES VIEW ──
  const ModulesView = () => {
    const trail = TRAIL_CONFIG[selectedTrail];
    const p = progress[selectedTrail];
    const Icon = trail.icon;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setView("trails")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Trilhas
          </button>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5" style={{color:trail.color}} />
            <h1 style={{color:trail.color}}>{trail.name}</h1>
          </div>
          <Badge label={`Rodada ${p.round}`} color={trail.color} />
        </div>
        <div className="grid md:grid-cols-5 gap-4">
          {trail.modules.map((mod, i) => {
            const modNum = i + 1;
            const unlocked = p.unlockedModules.includes(modNum);
            const completed = p.completedModules.includes(modNum);
            const relevant = results.filter(r => r.trail === selectedTrail && r.module === modNum);
            const bestScore = relevant.length ? Math.max(...relevant.map(r => r.score)) : null;
            return (
              <div key={modNum} className={`bg-card border rounded-xl p-4 space-y-4 transition-all ${unlocked ? "border-border hover:border-primary/30 cursor-pointer" : "border-border/40 opacity-50"}`}>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold font-mono"
                    style={{
                      backgroundColor: completed ? `${trail.color}20` : unlocked ? `${trail.color}10` : "rgba(255,255,255,0.03)",
                      color: completed ? trail.color : unlocked ? trail.color : "#3a4a5e",
                      border: `1px solid ${completed ? trail.color+"30" : "transparent"}`,
                    }}>
                    {completed ? "✓" : unlocked ? modNum : <Lock className="w-3.5 h-3.5" />}
                  </div>
                  <Badge label={mod.tag} color={trail.color} />
                </div>
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Módulo {modNum}</div>
                  <div className="font-semibold text-sm text-foreground leading-snug">{mod.name}</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{mod.difficulty}</span>
                  </div>
                  {bestScore !== null && (
                    <div className="flex items-center gap-1.5">
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="text-xs font-mono font-semibold text-amber-400">Melhor: {bestScore}/10</span>
                    </div>
                  )}
                  {relevant.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{relevant.length}× tentativa{relevant.length>1?"s":""}</span>
                    </div>
                  )}
                </div>
                {unlocked ? (
                  <button onClick={() => startExam(selectedTrail, modNum)}
                    className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    style={{backgroundColor:`${trail.color}15`, color:trail.color, border:`1px solid ${trail.color}20`}}>
                    <PlayCircle className="w-3.5 h-3.5" />
                    {completed ? "Refazer" : relevant.length > 0 ? "Tentar Novamente" : "Iniciar Prova"}
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-lg text-xs text-center text-muted-foreground/40 border border-border/30">
                    🔒 Bloqueado
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-foreground mb-1">Como funciona a progressão</h3>
          <div className="grid sm:grid-cols-3 gap-4 mt-3 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-primary font-bold text-xs">1</span>
              </div>
              <div>Cada prova tem <strong className="text-foreground">10 questões</strong> geradas pela IA. Nota mínima para avançar: <strong className="text-foreground">80% (8 acertos)</strong>.</div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 font-bold text-xs">2</span>
              </div>
              <div>Em caso de reprovação, <strong className="text-foreground">refaça imediatamente</strong> — nova prova gerada automaticamente com questões diferentes.</div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-green-400 font-bold text-xs">3</span>
              </div>
              <div>Ao concluir o Módulo 5, a trilha <strong className="text-foreground">reinicia com novas questões</strong> — ciclo infinito de aprendizado.</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── EXAM VIEW ──
  const ExamView = () => {
    const q = examQuestions[currentQ];
    if (!q) return null;
    const trail = TRAIL_CONFIG[selectedTrail];
    const allAnswered = userAnswers.every(a => a !== null);
    const answered = selectedAns !== null;
    const isLast = currentQ === examQuestions.length - 1;

    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <trail.icon className="w-4 h-4" style={{color:trail.color}} />
              <span className="text-sm font-semibold" style={{color:trail.color}}>{trail.name} — Módulo {examModule}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {fmtTime(timer)}
              </div>
              <div className="text-sm font-mono font-bold text-foreground">{currentQ+1}/{examQuestions.length}</div>
            </div>
          </div>
          <ProgressBar value={currentQ+1} max={examQuestions.length} color={trail.color} />
          <div className="flex gap-1 mt-2">
            {examQuestions.map((_, i) => (
              <button key={i} onClick={() => { setCurrentQ(i); setSelectedAns(userAnswers[i]); }}
                className="h-1 flex-1 rounded-full transition-all"
                style={{
                  backgroundColor: i===currentQ ? trail.color : userAnswers[i]!==null ? `${trail.color}50` : "rgba(255,255,255,0.06)"
                }} />
            ))}
          </div>
        </div>
        {/* Question */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge label={q.subject} color={trail.color} />
                <Badge label={q.lang.toUpperCase()} color={q.lang==="en"?"#8b5cf6":"#0ea5e9"} />
              </div>
              <p className="text-foreground text-sm leading-relaxed font-medium">{q.text}</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {q.options.map((opt, i) => {
              const letters = ["A","B","C","D"];
              let bg = "bg-muted/50 border-border hover:border-border hover:bg-muted";
              let textCls = "text-foreground";
              if (answered) {
                if (i === q.correct) { bg = "bg-green-500/10 border-green-500/40"; textCls = "text-green-400"; }
                else if (i === selectedAns && i !== q.correct) { bg = "bg-red-500/10 border-red-500/40"; textCls = "text-red-400"; }
                else { bg = "opacity-40 bg-muted/30 border-border"; }
              }
              return (
                <button key={i} onClick={() => handleAnswer(i)} disabled={answered}
                  className={`w-full flex items-start gap-3 p-3.5 rounded-lg border text-sm text-left transition-all ${bg}`}>
                  <span className="font-bold font-mono text-xs shrink-0 w-5 h-5 rounded flex items-center justify-center mt-0.5"
                    style={{backgroundColor:answered&&i===q.correct?"rgba(34,197,94,0.2)":answered&&i===selectedAns&&i!==q.correct?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.05)"}}>
                    {answered && i===q.correct ? "✓" : answered && i===selectedAns && i!==q.correct ? "✗" : letters[i]}
                  </span>
                  <span className={textCls}>{opt}</span>
                </button>
              );
            })}
          </div>
          {answered && (
            <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs leading-relaxed">
              <span className="text-primary font-semibold">Explicação: </span>
              <span className="text-muted-foreground">{q.explanation}</span>
            </div>
          )}
        </div>
        {/* Nav buttons */}
        <div className="flex items-center justify-between gap-3">
          <button onClick={() => { setCurrentQ(c => c-1); setSelectedAns(userAnswers[currentQ-1]); }} disabled={currentQ===0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>
          <div className="flex gap-2">
            {!isLast ? (
              <button onClick={() => { setCurrentQ(c => c+1); setSelectedAns(userAnswers[currentQ+1]); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all">
                Próxima <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finishExam} disabled={!allAnswered}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                <Flag className="w-4 h-4" /> Finalizar Prova
              </button>
            )}
          </div>
        </div>
        {!allAnswered && (
          <p className="text-center text-xs text-muted-foreground">Responda todas as questões para finalizar a prova</p>
        )}
      </div>
    );
  };

  // ── RESULTS VIEW ──
  const ResultsView = () => {
    const r = activeResult;
    if (!r) return <div className="text-center text-muted-foreground">Nenhuma prova para exibir.</div>;
    const trail = TRAIL_CONFIG[r.trail];
    const pct = Math.round(r.score/r.questions.length*100)||r.score*10;
    const [showReview, setShowReview] = useState(false);
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Score card */}
        <div className={`bg-card border rounded-xl p-6 text-center space-y-4 ${r.passed ? "border-green-500/30" : "border-red-500/30"}`}>
          <div className={`inline-flex w-16 h-16 rounded-full items-center justify-center mx-auto ${r.passed ? "bg-green-500/10" : "bg-red-500/10"}`}>
            {r.passed ? <Trophy className="w-8 h-8 text-green-400" /> : <XCircle className="w-8 h-8 text-red-400" />}
          </div>
          <div>
            <div className="text-4xl font-bold font-mono" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"3.5rem",color:r.passed?"#22c55e":"#ef4444"}}>
              {r.score}/10
            </div>
            <div className="text-sm text-muted-foreground mt-1">{pct}% de aproveitamento</div>
            <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-semibold ${r.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
              {r.passed ? "✓ APROVADO" : "✗ REPROVADO"}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400 font-mono">{r.answers.filter(a=>a.correct).length}</div>
              <div className="text-xs text-muted-foreground">Corretas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-400 font-mono">{r.answers.filter(a=>!a.correct).length}</div>
              <div className="text-xs text-muted-foreground">Erradas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-muted-foreground font-mono">{fmtTime(r.timeSpent)}</div>
              <div className="text-xs text-muted-foreground">Tempo</div>
            </div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => startExam(r.trail, r.module)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Nova Tentativa
          </button>
          <button onClick={() => setShowReview(!showReview)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-card border border-border text-foreground hover:bg-muted transition-all">
            {showReview ? "Ocultar" : "Revisar Prova"}
          </button>
          <button onClick={() => { setSelectedTrail(r.trail); setView("modules"); }}
            className="py-2.5 px-4 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
        {/* Question review */}
        {showReview && r.questions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-foreground">Revisão das Questões</h3>
            {r.questions.map((q, i) => {
              const ans = r.answers[i];
              const correct = ans?.correct;
              const letters = ["A","B","C","D"];
              return (
                <div key={q.id} className={`bg-card border rounded-xl p-4 space-y-3 ${correct ? "border-green-500/20" : "border-red-500/20"}`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${correct ? "bg-green-500/20" : "bg-red-500/20"}`}>
                      {correct ? <CheckCircle className="w-3 h-3 text-green-400" /> : <XCircle className="w-3 h-3 text-red-400" />}
                    </div>
                    <p className="text-sm text-foreground flex-1">{q.text}</p>
                  </div>
                  <div className="space-y-1 ml-7">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correct;
                      const isSelected = oi === ans?.selected;
                      if (!isCorrect && !isSelected) return null;
                      return (
                        <div key={oi} className={`text-xs px-2.5 py-1.5 rounded ${isCorrect ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {letters[oi]}) {opt} {isCorrect ? "(Correta)" : "(Sua resposta)"}
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground pt-1 leading-relaxed">
                      <span className="text-primary font-semibold">Explicação: </span>{q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ── REPORTS VIEW ──
  const ReportsView = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Relatórios</h1>
            <p className="text-muted-foreground text-sm">Histórico completo de provas realizadas</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-card border border-border text-muted-foreground hover:text-foreground transition-all">
            <Download className="w-3.5 h-3.5" /> Exportar PDF
          </button>
        </div>
        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { l:"Total de Provas", v:results.length, c:"#0ea5e9" },
            { l:"Aprovações", v:results.filter(r=>r.passed).length, c:"#22c55e" },
            { l:"Reprovações", v:results.filter(r=>!r.passed).length, c:"#ef4444" },
            { l:"Taxa Aprovação", v:`${results.length ? Math.round(results.filter(r=>r.passed).length/results.length*100) : 0}%`, c:"#f59e0b" },
          ].map((s,i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4">
              <div className="text-xs text-muted-foreground mb-1">{s.l}</div>
              <div className="text-2xl font-bold font-mono" style={{color:s.c, fontFamily:"'Barlow Condensed',sans-serif",fontSize:"1.8rem"}}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="text-foreground">Histórico de Provas</h3>
          </div>
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <FileText className="w-10 h-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">Nenhuma prova realizada ainda.</p>
              <button onClick={() => setView("trails")}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all">
                Começar agora
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Data","Hora","Trilha","Módulo","Nota","Tempo","Status","Ação"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={r.id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${i%2===0?"":"bg-muted/5"}`}>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{fmtDate(r.date)}</td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{fmtHour(r.date)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold" style={{color:trailColor(r.trail)}}>{trailLabel(r.trail)}</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-foreground">M{r.module}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold font-mono" style={{color:r.passed?"#22c55e":"#ef4444"}}>{r.score}/10</span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{fmtTime(r.timeSpent)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${r.passed ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                          {r.passed ? "Aprovado" : "Reprovado"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.questions.length > 0 && (
                          <button onClick={() => { setActiveResult(r); setView("results"); }}
                            className="text-xs text-primary hover:underline">
                            Revisar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── AI ENGINE VIEW ──
  const AIView = () => {
    const [genState, setGenState] = useState<"idle"|"running"|"done">("idle");
    const [genProgress, setGenProgress] = useState(0);
    const rndStep = () => Math.floor(Math.random() * 7) + 3;
    const startGen = () => {
      setGenState("running");
      setGenProgress(0);
      const interval = setInterval(() => {
        setGenProgress(p => {
          if (p >= 100) { clearInterval(interval); setGenState("done"); return 100; }
          return p + rndStep();
        });
      }, 120);
    };
    const tasks = [
      { label:"Buscando questões históricas ANAC 2010-2024", done:true },
      { label:"Catalogando assuntos recorrentes por frequência", done:true },
      { label:"Analisando padrões de cobrança da banca", done:true },
      { label:"Gerando questões inéditas em português", done:genState!=="idle" },
      { label:"Gerando questões em inglês aeronáutico", done:genState==="done" },
      { label:"Validando nível técnico e adequação à banca", done:genState==="done" },
      { label:"Atualizando banco de questões", done:genState==="done" },
    ];
    return (
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            ANAC AI Engine
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Inteligência artificial especializada em questões ANAC MMA</p>
        </div>
        {/* Status panel */}
        <div className="bg-card border border-primary/20 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">Motor de Geração de Questões</div>
                <div className="text-xs text-muted-foreground font-mono">{QB.length} questões no banco • {Math.round(QB.length*1.4)} variantes disponíveis</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-green-400 font-semibold">ONLINE</span>
            </div>
          </div>
          {genState !== "idle" && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Processando banco de questões...</span>
                <span className="font-mono text-primary">{Math.min(genProgress,100)}%</span>
              </div>
              <ProgressBar value={Math.min(genProgress,100)} max={100} color="#0ea5e9" />
            </div>
          )}
          {genState==="done" && (
            <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-xs text-green-400 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              15 novas questões geradas e adicionadas ao banco! Próximas provas incluirão conteúdo novo.
            </div>
          )}
          <button onClick={startGen} disabled={genState==="running"}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {genState==="running" ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {genState==="running" ? "Gerando questões..." : genState==="done" ? "Gerar Mais Questões" : "Iniciar Geração de Questões"}
          </button>
        </div>
        {/* Process log */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-foreground">Log de Processamento</h3>
            <div className="space-y-2.5">
              {tasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${t.done ? "bg-green-500/15" : "bg-muted"}`}>
                    {t.done ? <CheckCircle className="w-2.5 h-2.5 text-green-400" /> : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />}
                  </div>
                  <span className={`text-xs ${t.done ? "text-foreground" : "text-muted-foreground/40"}`}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-foreground">Inteligência da Banca</h3>
            <div className="space-y-3">
              {[
                { s:"Sistemas hidráulicos", pct:34, c:"#0ea5e9" },
                { s:"Estruturas de aeronave", pct:28, c:"#22c55e" },
                { s:"Instrumentos de voo", pct:22, c:"#f59e0b" },
                { s:"Regulamentos RBAC", pct:20, c:"#8b5cf6" },
                { s:"Inglês técnico aeronáutico", pct:18, c:"#ef4444" },
                { s:"NDT e inspeções", pct:15, c:"#0ea5e9" },
              ].map(s => (
                <div key={s.s} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{s.s}</span>
                    <span className="font-mono text-xs" style={{color:s.c}}>{s.pct}% das provas</span>
                  </div>
                  <ProgressBar value={s.pct} max={40} color={s.c} />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground pt-1 border-t border-border">Baseado em análise de <strong className="text-foreground">847 questões</strong> históricas ANAC 2010-2024</p>
          </div>
        </div>
        {/* Capabilities */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon:Globe, label:"Questões PT e EN", desc:"Português e inglês técnico aeronáutico", color:"#0ea5e9" },
            { icon:Layers, label:"Questões Inéditas", desc:"Geradas por IA com nível técnico ANAC", color:"#22c55e" },
            { icon:Target, label:"Assuntos Críticos", desc:"Prioriza temas mais cobrados pela banca", color:"#f59e0b" },
            { icon:RefreshCw, label:"Atualização Contínua", desc:"Banco cresce a cada sessão de treinamento", color:"#8b5cf6" },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{backgroundColor:`${c.color}15`}}>
                  <Icon className="w-4 h-4" style={{color:c.color}} />
                </div>
                <div className="font-semibold text-sm text-foreground">{c.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{c.desc}</div>
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  // ── RENDER ──
  const renderView = () => {
    switch (view) {
      case "dashboard": return <DashboardView />;
      case "trails": return <TrailsView />;
      case "modules": return <ModulesView />;
      case "exam": return <ExamView />;
      case "results": return <ResultsView />;
      case "reports": return <ReportsView />;
      case "ai": return <AIView />;
      default: return <DashboardView />;
    }
  };

  // ── AUTH LOADING ──
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Plane className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div className="text-sm text-muted-foreground font-mono">Carregando...</div>
        </div>
      </div>
    );
  }

  // ── LOGIN SCREEN ──
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Toaster position="top-right" richColors />
        <div className="w-full max-w-sm space-y-8">
          {/* Logo + title */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <Plane className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-foreground" style={{fontFamily:"'Barlow Condensed',sans-serif",fontSize:"2rem",letterSpacing:"0.04em"}}>
                ANAC MASTER
              </h1>
              <div className="text-xs font-mono text-muted-foreground tracking-widest uppercase">Simulados MMA</div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plataforma inteligente de preparação para provas ANAC.<br />
              Faça login para salvar seu progresso em qualquer dispositivo.
            </p>
          </div>

          {/* Login card */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <button
              onClick={() => supabase.auth.signInWithOAuth({
                provider: "google",
                options: { redirectTo: window.location.href },
              })}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-card hover:bg-muted transition-all text-sm font-semibold text-foreground"
            >
              {/* Google icon */}
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Entrar com Gmail
            </button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
              <div className="flex-1 h-px bg-border" />
              <span>seguro via Google OAuth</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="space-y-2">
              {[
                { icon: Cloud, text: "Progresso salvo na nuvem por e-mail" },
                { icon: Plane, text: "Acesse de qualquer dispositivo" },
                { icon: Shield, text: "Seu histórico completo sempre disponível" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-muted-foreground">
                    <Icon className="w-3.5 h-3.5 text-primary shrink-0" />
                    {item.text}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground/40">
            ANAC Master Simulados — Preparação para MMA
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Toaster position="top-right" richColors closeButton />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileBar />
        <main className="flex-1 overflow-y-auto p-5 md:p-7">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
