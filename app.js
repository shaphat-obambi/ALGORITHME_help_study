"use strict";

/* ============================================================
   CONFIGURATION GLOBALE (PAR SOFT-KEY)
   ------------------------------------------------------------
   Ce bloc est le SEUL endroit à modifier pour adapter l'outil à
   une université : branding, comportement pédagogique et liste
   d'exercices. Le moteur d'exécution plus bas ne doit jamais
   être touché pour une simple personnalisation.
   ============================================================ */
const INSTITUTION_CONFIG = {
  // Identité et Branding
  developer: "SOFT-KEY",
  aiPowered: true,
  credits: "Conçu par SOFT-KEY avec l'assistance de l'IA",
  universityName: "Université / Institut",
  courseTitle: "Algorithmique & Logique de Programmation",
  logoText: "SOFT-KEY",
  accentColor: "#f2a93c",

  // Fenêtre "À propos" (menu Infos / Aide)
  appName: "SOFT-KEY Interpreter",
  designer: "SOFT-KEY",
  foundingYear: "2026",
  objective: "Environnement pédagogique interactif d'édition et d'exécution d'algorithmes en pseudo-code français.",
  contactEmail: "contact.softkey1@gmail.com",

  // Paramètres pédagogiques
  strictMode: false,          // Exige la déclaration préalable des variables
  allowEqualsForAssign: true, // Tolère '=' en plus de '<-' pour l'affectation

  // Exemples personnalisés
  examples: {
    moyenne: {
      label: "1. Calcul de Moyenne",
      code: `Algorithme MoyenneTableau\nVariables\n    n : Entier\n    notes : Tableau[10] de Entiers\n    i : Entier\n    somme : Entier\n    moyenne : Reel\nDébut\n    Ecrire("Combien de notes voulez-vous saisir (max 10) ? ")\n    Lire(n)\n    somme <- 0\n    Pour i De 0 À n - 1 Faire\n        Ecrire("Note ", i + 1, " : ")\n        Lire(notes[i])\n        somme <- somme + notes[i]\n    FinPour\n    moyenne <- somme / n\n    Ecrire("La moyenne est : ", moyenne)\nFin`
    },
    maximum: {
      label: "2. Recherche de Maximum",
      code: `Algorithme MaximumListe\nVariables\n    valeurs : Tableau[5] de Entiers\n    i : Entier\n    max : Entier\nDébut\n    Pour i De 0 À 4 Faire\n        Ecrire("Valeur ", i + 1, " : ")\n        Lire(valeurs[i])\n    FinPour\n    max <- valeurs[0]\n    Pour i De 1 À 4 Faire\n        Si valeurs[i] > max Alors\n            max <- valeurs[i]\n        FinSi\n    FinPour\n    Ecrire("Le maximum est : ", max)\nFin`
    },
    parite: {
      label: "3. Structure Si / Sinon (parité)",
      code: `Algorithme ParitePositif\nVariables\n    n : Entier\nDébut\n    Ecrire("Entrez un nombre entier : ")\n    Lire(n)\n    Si n Mod 2 = 0 Alors\n        Ecrire(n, " est pair")\n    Sinon\n        Ecrire(n, " est impair")\n    FinSi\n    Si n >= 0 Alors\n        Ecrire("Il est positif ou nul")\n    Sinon\n        Ecrire("Il est négatif")\n    FinSi\nFin`
    },
    selon: {
      label: "4. Selon / Cas — jour de la semaine",
      code: `Algorithme JourDeLaSemaine\nVariables\n    jour : Entier\nDébut\n    Ecrire("Entrez un numéro de jour (1 à 7) : ")\n    Lire(jour)\n    Selon jour Faire\n        Cas 1 :\n            Ecrire("Lundi")\n        Cas 2 :\n            Ecrire("Mardi")\n        Cas 3 :\n            Ecrire("Mercredi")\n        Cas 4 :\n            Ecrire("Jeudi")\n        Cas 5 :\n            Ecrire("Vendredi")\n        Cas 6 :\n            Ecrire("Samedi")\n        Cas 7 :\n            Ecrire("Dimanche")\n        Autrement :\n            Ecrire("Numéro de jour invalide")\n    FinSelon\nFin`
    },
    repeter: {
      label: "5. Répéter…Jusqu'à — saisie contrôlée",
      code: `Algorithme SaisieControlee\nVariables\n    nombre : Entier\nDébut\n    Répéter\n        Ecrire("Entrez un nombre entre 1 et 10 : ")\n        Lire(nombre)\n        Si nombre < 1 Ou nombre > 10 Alors\n            Ecrire("Valeur hors limites, réessayez.")\n        FinSi\n    Jusqu'à nombre >= 1 Et nombre <= 10\n    Ecrire("Merci, valeur validée : ", nombre)\nFin`
    },
    fonctionsProcedures: {
      label: "6. Fonction & Procédure — nombre premier",
      code: `Algorithme DemoFonctionsProcedures\n\nFonction EstPremier(n) : Booleen\nVariables\n    i : Entier\n    premier : Booleen\nDébut\n    Si n < 2 Alors\n        Retourner Faux\n    FinSi\n    premier <- Vrai\n    Pour i De 2 À n - 1 Faire\n        Si n Mod i = 0 Alors\n            premier <- Faux\n        FinSi\n    FinPour\n    Retourner premier\nFinFonction\n\nProcédure AfficherResultat(nombre, estPremierResultat)\nDébut\n    Si estPremierResultat Alors\n        Ecrire(nombre, " est un nombre premier.")\n    Sinon\n        Ecrire(nombre, " n'est pas un nombre premier.")\n    FinSi\nFinProcédure\n\nVariables\n    n : Entier\n    resultat : Booleen\nDébut\n    Ecrire("Entrez un nombre entier : ")\n    Lire(n)\n    resultat <- EstPremier(n)\n    Appeler AfficherResultat(n, resultat)\nFin`
    }
  }
};

/* ============================================================
   OUTILS DE BASE
   ============================================================ */
function stripAccents(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function KW(tok){ return tok===undefined ? '' : stripAccents(String(tok)).toLowerCase(); }

class PseudoError extends Error{
  constructor(message, line){ super(message); this.line = line; }
}

/* Levée quand l'utilisateur clique sur "Arrêter" : ce n'est pas une erreur
   de programme, juste une interruption volontaire ; traitée séparément
   dans l'UI (message neutre, pas de préfixe "Erreur"). */
class StopRequested extends Error{}

/* Signal de contrôle interne pour "Retourner"/"Retourne" à l'intérieur d'une
   Fonction/Procédure : remonte jusqu'au point d'appel (invokeCallable) via
   les mêmes mécanismes JS que StopRequested, mais n'est JAMAIS une erreur
   utilisateur — si elle s'échappe jusqu'au programme principal (Retourner
   utilisé hors de toute Fonction/Procédure), Interpreter.run() la convertit
   en PseudoError explicite. */
class ReturnSignal{
  constructor(value, line){ this.value = value; this.line = line; }
}

/* ============================================================
   TOKENISATION
   ============================================================ */
/* L'alternative de contraction ([lettres]'[lettres]) est placée avant celle
   des chaînes entre apostrophes : elle capture des mots comme "Jusqu'à" en
   un seul jeton, sans jamais s'appliquer à une vraie chaîne 'texte' (qui
   commence directement par une apostrophe, pas par une lettre). */
const TOKEN_RE = /<-|<>|<=|>=|[A-Za-zÀ-ÖØ-öø-ÿ_]+'[A-Za-zÀ-ÖØ-öø-ÿ_]+|"[^"]*"|'[^']*'|\d+\.\d+|\d+|[A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*|[+\-*/%=<>()\[\],:&]/g;

function tokenizeLine(line){
  const tokens = [];
  let m;
  TOKEN_RE.lastIndex = 0;
  while((m = TOKEN_RE.exec(line))){ tokens.push(m[0]); }
  return tokens;
}

function preprocess(source){
  return source.split('\n').map((raw, i) => {
    let line = raw;
    const c1 = line.indexOf('//');
    if(c1 >= 0) line = line.slice(0, c1);
    return { raw, num: i + 1, tokens: tokenizeLine(line) };
  }).filter(l => l.tokens.length > 0);
}

/* Aides sur les flux de jetons */
function findTopLevel(tokens, kwSet, start = 0){
  let depth = 0;
  for(let i = start; i < tokens.length; i++){
    const t = tokens[i];
    if(t === '(' || t === '[') depth++;
    else if(t === ')' || t === ']') depth--;
    else if(depth === 0 && kwSet.has(KW(t))) return i;
  }
  return -1;
}
function findMatchingBracket(tokens, openIdx){
  const open = tokens[openIdx];
  const close = open === '(' ? ')' : ']';
  let depth = 0;
  for(let i = openIdx; i < tokens.length; i++){
    if(tokens[i] === open) depth++;
    else if(tokens[i] === close){ depth--; if(depth === 0) return i; }
  }
  return -1;
}
function splitTopLevelCommas(tokens){
  const groups = []; let current = []; let depth = 0;
  for(const t of tokens){
    if(t === '(' || t === '[') depth++;
    if(t === ')' || t === ']') depth--;
    if(t === ',' && depth === 0){ groups.push(current); current = []; }
    else current.push(t);
  }
  groups.push(current);
  return groups;
}
function isIdentToken(tok){ return /^[A-Za-zÀ-ÖØ-öø-ÿ_]/.test(tok || ''); }

/* ============================================================
   EXPRESSIONS — analyse récursive descendante
   ============================================================ */
class ExprParser{
  constructor(tokens, line){ this.tokens = tokens; this.pos = 0; this.line = line; }
  peek(){ return this.tokens[this.pos]; }
  atEnd(){ return this.pos >= this.tokens.length; }
  eat(){ return this.tokens[this.pos++]; }
  expect(tok){ if(this.peek() !== tok) throw new PseudoError(`Attendu "${tok}" dans l'expression`, this.line); return this.eat(); }

  parse(){
    if(this.tokens.length === 0) throw new PseudoError('Expression manquante', this.line);
    const e = this.parseOr();
    if(!this.atEnd()) throw new PseudoError(`Jeton inattendu dans l'expression : "${this.peek()}"`, this.line);
    return e;
  }
  parseOr(){
    let left = this.parseAnd();
    while(!this.atEnd() && KW(this.peek()) === 'ou'){ this.eat(); left = { type:'Bin', op:'ou', left, right:this.parseAnd() }; }
    return left;
  }
  parseAnd(){
    let left = this.parseNot();
    while(!this.atEnd() && KW(this.peek()) === 'et'){ this.eat(); left = { type:'Bin', op:'et', left, right:this.parseNot() }; }
    return left;
  }
  parseNot(){
    if(!this.atEnd() && KW(this.peek()) === 'non'){ this.eat(); return { type:'Un', op:'non', expr:this.parseNot() }; }
    return this.parseCompare();
  }
  parseCompare(){
    let left = this.parseAdd();
    if(!this.atEnd() && ['=','<>','<','>','<=','>='].includes(this.peek())){
      const op = this.eat();
      left = { type:'Bin', op, left, right:this.parseAdd() };
    }
    return left;
  }
  parseAdd(){
    let left = this.parseMul();
    while(!this.atEnd() && ['+','-','&'].includes(this.peek())){
      const op = this.eat();
      left = { type:'Bin', op, left, right:this.parseMul() };
    }
    return left;
  }
  parseMul(){
    let left = this.parseUnary();
    while(!this.atEnd() && (['*','/','%'].includes(this.peek()) || ['mod','div'].includes(KW(this.peek())))){
      let op = this.eat();
      if(op !== '*' && op !== '/' && op !== '%') op = KW(op);
      left = { type:'Bin', op, left, right:this.parseUnary() };
    }
    return left;
  }
  parseUnary(){
    if(!this.atEnd() && (this.peek() === '-' || this.peek() === '+')){
      const op = this.eat();
      return { type:'Un', op, expr:this.parseUnary() };
    }
    return this.parsePrimary();
  }
  parsePrimary(){
    if(this.atEnd()) throw new PseudoError('Expression incomplète', this.line);
    const tok = this.peek();
    if(tok === '('){ this.eat(); const e = this.parseOr(); this.expect(')'); return e; }
    if(/^\d+(\.\d+)?$/.test(tok)){ this.eat(); return { type:'Num', value:Number(tok) }; }
    if(/^".*"$/.test(tok) || /^'.*'$/.test(tok)){ this.eat(); return { type:'Str', value: tok.slice(1, -1) }; }
    const k = KW(tok);
    if(k === 'vrai'){ this.eat(); return { type:'Bool', value:true }; }
    if(k === 'faux'){ this.eat(); return { type:'Bool', value:false }; }
    if(isIdentToken(tok)){
      this.eat();
      if(!this.atEnd() && this.peek() === '['){
        this.eat();
        const idx = this.parseOr();
        this.expect(']');
        return { type:'Index', name: tok, index: idx };
      }
      if(!this.atEnd() && this.peek() === '('){
        this.eat();
        const args = [];
        if(!this.atEnd() && this.peek() !== ')'){
          args.push(this.parseOr());
          while(!this.atEnd() && this.peek() === ','){ this.eat(); args.push(this.parseOr()); }
        }
        this.expect(')');
        return { type:'Call', name: tok, args };
      }
      return { type:'Var', name: tok };
    }
    throw new PseudoError(`Jeton inattendu dans l'expression : "${tok}"`, this.line);
  }
}
function parseExprTokens(tokens, line){ return new ExprParser(tokens, line).parse(); }

/* ============================================================
   ANALYSE SYNTAXIQUE DES INSTRUCTIONS / DU PROGRAMME
   ============================================================ */
function normalizeTypeName(tok){
  let t = KW(tok).replace(/s$/, '');
  if(t.startsWith('entier')) return 'entier';
  if(t.startsWith('reel'))   return 'reel';
  if(t.startsWith('chain'))  return 'chaine';
  if(t.startsWith('boolee')) return 'booleen';
  if(t.startsWith('caracter')) return 'caractere';
  return t;
}
function defaultForType(type){
  switch(type){
    case 'entier': case 'reel': return 0;
    case 'booleen': return false;
    default: return '';
  }
}
/* Évaluateur d'expression CONSTANTE, utilisé uniquement à l'analyse pour la
   taille d'un tableau (ex. Tableau[2+3] de Entiers). Volontairement séparé
   de evalExpr (qui doit pouvoir être asynchrone pour appeler des Fonctions
   utilisateur) : à ce stade, aucune variable ni fonction n'existe encore. */
function evalConstNumericExpr(node, line){
  switch(node.type){
    case 'Num': return node.value;
    case 'Un': {
      const v = evalConstNumericExpr(node.expr, line);
      if(node.op === '-') return -v;
      if(node.op === '+') return +v;
      throw new PseudoError('Expression constante invalide pour une taille de tableau.', line);
    }
    case 'Bin': {
      const l = evalConstNumericExpr(node.left, line);
      const r = evalConstNumericExpr(node.right, line);
      switch(node.op){
        case '+': return l + r;
        case '-': return l - r;
        case '*': return l * r;
        case '/': return l / r;
        default: throw new PseudoError('Expression constante invalide pour une taille de tableau.', line);
      }
    }
    default:
      throw new PseudoError('Une taille de tableau doit être un nombre ou une expression arithmétique constante.', line);
  }
}

function parseDeclarationGroup(tokens, line){
  const colonIdx = tokens.indexOf(':');
  if(colonIdx <= 0) throw new PseudoError(`Déclaration invalide : "${tokens.join(' ')}" (":" manquant ou nom absent)`, line);
  const name = tokens[0];
  const typeTokens = tokens.slice(colonIdx + 1);
  if(typeTokens.length === 0) throw new PseudoError(`Type manquant pour la variable "${name}"`, line);

  if(KW(typeTokens[0]) === 'tableau'){
    if(typeTokens[1] !== '[') throw new PseudoError(`Attendu "[" après Tableau pour "${name}"`, line);
    const close = findMatchingBracket(typeTokens, 1);
    if(close === -1) throw new PseudoError(`Crochet non fermé dans la déclaration de "${name}"`, line);
    const sizeTokens = typeTokens.slice(2, close);
    let size = NaN;
    if(sizeTokens.length === 1 && /^\d+$/.test(sizeTokens[0])) size = parseInt(sizeTokens[0], 10);
    else{
      try{ const v = evalConstNumericExpr(parseExprTokens(sizeTokens, line), line); if(typeof v === 'number') size = Math.trunc(v); }
      catch(e){ /* laissé à NaN */ }
    }
    if(!Number.isInteger(size) || size <= 0) throw new PseudoError(`Taille de tableau invalide pour "${name}"`, line);
    if(KW(typeTokens[close + 1]) !== 'de') throw new PseudoError(`Mot-clé "de" manquant dans la déclaration de "${name}"`, line);
    const baseTok = typeTokens[close + 2];
    if(!baseTok) throw new PseudoError(`Type de base manquant pour le tableau "${name}"`, line);
    return { kind:'array', name, size, base: normalizeTypeName(baseTok) };
  }
  return { kind:'scalar', name, type: normalizeTypeName(typeTokens[0]) };
}

class Parser{
  constructor(lines, config = {}){ this.lines = lines; this.pos = 0; this.config = config; }
  atEnd(){ return this.pos >= this.lines.length; }
  peekLine(){ return this.lines[this.pos]; }
  currentKW(){ return this.atEnd() ? null : KW(this.peekLine().tokens[0]); }
  advance(){ return this.lines[this.pos++]; }
  lastLineNum(){ return this.lines.length ? this.lines[this.lines.length - 1].num : 0; }

  /* Consomme un bloc "Variables" (mot-clé déjà repéré via currentKW() ===
     'variables') et retourne la liste de déclarations. Réutilisé pour les
     variables globales du programme ET pour les variables locales d'une
     Fonction/Procédure. S'arrête au premier mot-clé de `stopSet`. */
  parseDeclarationBlock(stopSet){
    const groups = [];
    const first = this.advance(); // la ligne "Variables"
    const pushLine = (tokens, num) => {
      if(tokens.length === 0) return;
      for(const g of splitTopLevelCommas(tokens)) if(g.length) groups.push({ tokens: g, num });
    };
    pushLine(first.tokens.slice(1), first.num);
    while(!this.atEnd() && !stopSet.has(this.currentKW())){
      const l = this.advance();
      pushLine(l.tokens, l.num);
    }
    return groups.map((g) => parseDeclarationGroup(g.tokens, g.num));
  }

  /* Déclaration "Fonction Nom(p1, p2) : Type ... Début ... Retourner ... FinFonction"
     ou "Procédure Nom(p1, p2) ... Début ... FinProcédure". */
  parseCallableDecl(kind){
    const isFunc = kind === 'fonction';
    const label = isFunc ? 'Fonction' : 'Procédure';
    const finKw = isFunc ? 'finfonction' : 'finprocedure';
    const header = this.advance();
    const tokens = header.tokens;

    const name = tokens[1];
    if(!name || !isIdentToken(name)) throw new PseudoError(`Nom de ${label.toLowerCase()} attendu après "${label}".`, header.num);
    if(tokens[2] !== '(') throw new PseudoError(`Attendu "(" après le nom de la ${label.toLowerCase()}.`, header.num);
    const closeParen = findMatchingBracket(tokens, 2);
    if(closeParen === -1) throw new PseudoError('Parenthèse non fermée dans la déclaration.', header.num);
    const paramTokens = tokens.slice(3, closeParen);
    const params = paramTokens.length ? splitTopLevelCommas(paramTokens).map((g) => {
      if(g.length !== 1 || !isIdentToken(g[0])) throw new PseudoError(`Paramètre invalide dans la déclaration de "${name}".`, header.num);
      return g[0];
    }) : [];

    let returnType = null;
    if(isFunc){
      if(tokens[closeParen + 1] !== ':') throw new PseudoError(`Type de retour manquant (": Type") après les paramètres de la fonction "${name}".`, header.num);
      const typeTok = tokens[closeParen + 2];
      if(!typeTok) throw new PseudoError(`Type de retour manquant pour la fonction "${name}".`, header.num);
      returnType = normalizeTypeName(typeTok);
    }

    let localDecls = [];
    if(this.currentKW() === 'variables'){
      localDecls = this.parseDeclarationBlock(new Set(['debut']));
    }

    if(this.currentKW() !== 'debut') throw new PseudoError(`Mot-clé "Début" manquant dans la déclaration de "${label} ${name}".`, header.num);
    this.advance();

    const body = this.parseBlock(new Set([finKw]));
    if(this.currentKW() !== finKw) throw new PseudoError(`Mot-clé "${isFunc ? 'FinFonction' : 'FinProcédure'}" manquant pour "${name}".`, header.num);
    this.advance();

    return { name, params, returnType, localDecls, body, isFunc, line: header.num };
  }

  parseProgram(){
    if(this.lines.length === 0) throw new PseudoError('Le programme est vide.', 0);
    if(this.currentKW() === 'algorithme') this.advance();

    const declarations = [];
    const functions = {};
    const procedures = {};

    // Variables, Fonction et Procédure peuvent apparaître dans n'importe
    // quel ordre avant "Début", chacun étant reconnu par son mot-clé.
    while(!this.atEnd() && this.currentKW() !== 'debut'){
      const kw = this.currentKW();
      if(kw === 'variables'){
        declarations.push(...this.parseDeclarationBlock(new Set(['debut', 'fonction', 'procedure'])));
      } else if(kw === 'fonction'){
        const decl = this.parseCallableDecl('fonction');
        functions[KW(decl.name)] = decl;
      } else if(kw === 'procedure'){
        const decl = this.parseCallableDecl('procedure');
        procedures[KW(decl.name)] = decl;
      } else {
        const badLine = this.peekLine();
        throw new PseudoError(`Élément inattendu avant "Début" : "${badLine.tokens.join(' ')}"`, badLine.num);
      }
    }

    if(this.currentKW() !== 'debut') throw new PseudoError('Mot-clé "Début" manquant.', this.atEnd() ? this.lastLineNum() : this.peekLine().num);
    this.advance();

    const body = this.parseBlock(new Set(['fin']));

    if(this.currentKW() !== 'fin') throw new PseudoError('Mot-clé "Fin" manquant (fin du fichier atteinte).', this.lastLineNum());
    this.advance();

    return { declarations, functions, procedures, body };
  }

  parseBlock(stopSet){
    const stmts = [];
    while(!this.atEnd() && !stopSet.has(this.currentKW())) stmts.push(this.parseStatement());
    return stmts;
  }

  parseStatement(){
    const line = this.advance();
    const tokens = line.tokens;
    const kw = KW(tokens[0]);

    if(kw === 'si'){
      const alorsIdx = findTopLevel(tokens, new Set(['alors']), 1);
      if(alorsIdx === -1) throw new PseudoError('Mot-clé "Alors" manquant après "Si".', line.num);
      const cond = parseExprTokens(tokens.slice(1, alorsIdx), line.num);
      const thenBlock = this.parseBlock(new Set(['sinonsi', 'sinon', 'finsi']));
      const elifs = [];
      while(this.currentKW() === 'sinonsi'){
        const elifLine = this.advance();
        const elifTokens = elifLine.tokens;
        const elifAlorsIdx = findTopLevel(elifTokens, new Set(['alors']), 1);
        if(elifAlorsIdx === -1) throw new PseudoError('Mot-clé "Alors" manquant après "SinonSi".', elifLine.num);
        const elifCond = parseExprTokens(elifTokens.slice(1, elifAlorsIdx), elifLine.num);
        const elifBlock = this.parseBlock(new Set(['sinonsi', 'sinon', 'finsi']));
        elifs.push({ cond: elifCond, block: elifBlock });
      }
      let elseBlock = null;
      if(this.currentKW() === 'sinon'){ this.advance(); elseBlock = this.parseBlock(new Set(['finsi'])); }
      if(this.currentKW() !== 'finsi') throw new PseudoError('Mot-clé "FinSi" manquant.', line.num);
      this.advance();
      return { type:'Si', cond, then: thenBlock, elifs, else: elseBlock, line: line.num };
    }

    if(kw === 'pour'){
      const varName = tokens[1];
      if(!varName || !isIdentToken(varName)) throw new PseudoError('Nom de variable attendu après "Pour".', line.num);
      if(KW(tokens[2]) !== 'de') throw new PseudoError('Mot-clé "De" attendu dans "Pour".', line.num);
      const aIdx = findTopLevel(tokens, new Set(['a']), 3);
      if(aIdx === -1) throw new PseudoError('Mot-clé "À" manquant dans "Pour".', line.num);
      const faireIdx = findTopLevel(tokens, new Set(['faire']), aIdx + 1);
      if(faireIdx === -1) throw new PseudoError('Mot-clé "Faire" manquant dans "Pour".', line.num);
      const pasIdx = findTopLevel(tokens, new Set(['pas']), aIdx + 1);
      let toEnd = faireIdx, stepTokens = null;
      if(pasIdx !== -1 && pasIdx < faireIdx){ toEnd = pasIdx; stepTokens = tokens.slice(pasIdx + 1, faireIdx); }
      const fromExpr = parseExprTokens(tokens.slice(3, aIdx), line.num);
      const toExpr = parseExprTokens(tokens.slice(aIdx + 1, toEnd), line.num);
      const stepExpr = stepTokens ? parseExprTokens(stepTokens, line.num) : null;
      const body = this.parseBlock(new Set(['finpour']));
      if(this.currentKW() !== 'finpour') throw new PseudoError('Mot-clé "FinPour" manquant.', line.num);
      this.advance();
      return { type:'Pour', varName, from: fromExpr, to: toExpr, step: stepExpr, body, line: line.num };
    }

    if(kw === 'tantque'){
      const faireIdx = findTopLevel(tokens, new Set(['faire']), 1);
      if(faireIdx === -1) throw new PseudoError('Mot-clé "Faire" manquant dans "TantQue".', line.num);
      const cond = parseExprTokens(tokens.slice(1, faireIdx), line.num);
      const body = this.parseBlock(new Set(['fintantque']));
      if(this.currentKW() !== 'fintantque') throw new PseudoError('Mot-clé "FinTantQue" manquant.', line.num);
      this.advance();
      return { type:'TantQue', cond, body, line: line.num };
    }

    if(kw === 'repeter'){
      const body = this.parseBlock(new Set(["jusqu'a"]));
      if(this.currentKW() !== "jusqu'a") throw new PseudoError('Mot-clé "Jusqu\'à" manquant après "Répéter".', line.num);
      const untilLine = this.advance();
      const condTokens = untilLine.tokens.slice(1);
      if(condTokens.length === 0) throw new PseudoError('Condition manquante après "Jusqu\'à".', untilLine.num);
      const cond = parseExprTokens(condTokens, untilLine.num);
      return { type:'Repeter', body, cond, line: line.num };
    }

    if(kw === 'selon'){
      const faireIdx = findTopLevel(tokens, new Set(['faire']), 1);
      if(faireIdx === -1) throw new PseudoError('Mot-clé "Faire" manquant après "Selon".', line.num);
      const switchExpr = parseExprTokens(tokens.slice(1, faireIdx), line.num);
      const cases = [];
      let defaultBlock = null;
      while(!this.atEnd() && this.currentKW() !== 'finselon'){
        const branchKw = this.currentKW();
        if(branchKw === 'cas'){
          const casLine = this.advance();
          const casTokens = casLine.tokens;
          if(casTokens[casTokens.length - 1] !== ':')
            throw new PseudoError('"Cas" doit se terminer par ":".', casLine.num);
          const valueTokens = casTokens.slice(1, casTokens.length - 1);
          if(valueTokens.length === 0) throw new PseudoError('Valeur manquante après "Cas".', casLine.num);
          const valueExpr = parseExprTokens(valueTokens, casLine.num);
          const block = this.parseBlock(new Set(['cas', 'autrement', 'finselon']));
          cases.push({ value: valueExpr, block });
        } else if(branchKw === 'autrement'){
          const autrementLine = this.advance();
          const autrementTokens = autrementLine.tokens;
          if(autrementTokens[autrementTokens.length - 1] !== ':')
            throw new PseudoError('"Autrement" doit se terminer par ":".', autrementLine.num);
          defaultBlock = this.parseBlock(new Set(['cas', 'autrement', 'finselon']));
        } else {
          const badLine = this.peekLine();
          throw new PseudoError(`Instruction inattendue dans "Selon" (attendu "Cas" ou "Autrement") : "${badLine.tokens.join(' ')}"`, badLine.num);
        }
      }
      if(this.currentKW() !== 'finselon') throw new PseudoError('Mot-clé "FinSelon" manquant.', line.num);
      this.advance();
      return { type:'Selon', expr: switchExpr, cases, default: defaultBlock, line: line.num };
    }

    if(kw === 'lire'){
      if(tokens[1] !== '(') throw new PseudoError('Attendu "(" après "Lire".', line.num);
      const close = findMatchingBracket(tokens, 1);
      if(close === -1) throw new PseudoError('Parenthèse non fermée après "Lire".', line.num);
      const inner = tokens.slice(2, close);
      if(inner.length === 0) throw new PseudoError('"Lire()" attend un nom de variable.', line.num);
      const name = inner[0];
      if(!isIdentToken(name)) throw new PseudoError(`Nom de variable invalide : "${name}".`, line.num);
      let indexExpr = null;
      if(inner.length > 1){
        if(inner[1] !== '[') throw new PseudoError(`Syntaxe invalide après "${name}" dans "Lire".`, line.num);
        const c2 = findMatchingBracket(inner, 1);
        if(c2 === -1 || c2 !== inner.length - 1) throw new PseudoError('Crochet non fermé dans "Lire".', line.num);
        indexExpr = parseExprTokens(inner.slice(2, c2), line.num);
      }
      return { type:'Lire', name, indexExpr, line: line.num };
    }

    if(kw === 'ecrire'){
      if(tokens[1] !== '(') throw new PseudoError('Attendu "(" après "Ecrire".', line.num);
      const close = findMatchingBracket(tokens, 1);
      if(close === -1) throw new PseudoError('Parenthèse non fermée après "Ecrire".', line.num);
      const inner = tokens.slice(2, close);
      const groups = inner.length ? splitTopLevelCommas(inner) : [];
      const args = groups.map(g => parseExprTokens(g, line.num));
      return { type:'Ecrire', args, line: line.num };
    }

    if(kw === 'retourner' || kw === 'retourne'){
      const exprTokens = tokens.slice(1);
      const expr = exprTokens.length ? parseExprTokens(exprTokens, line.num) : null;
      return { type:'Retourner', expr, line: line.num };
    }

    if(kw === 'appeler'){
      const rest = tokens.slice(1);
      if(rest.length === 0 || !isIdentToken(rest[0])) throw new PseudoError('Nom de procédure attendu après "Appeler".', line.num);
      const name = rest[0];
      if(rest[1] !== '(') throw new PseudoError(`Attendu "(" après "${name}".`, line.num);
      const close = findMatchingBracket(rest, 1);
      if(close === -1 || close !== rest.length - 1) throw new PseudoError('Parenthèse non fermée dans l\'appel.', line.num);
      const argTokens = rest.slice(2, close);
      const args = argTokens.length ? splitTopLevelCommas(argTokens).map((g) => parseExprTokens(g, line.num)) : [];
      return { type:'AppelProcedure', name, args, line: line.num };
    }

    /* Appel de procédure sans "Appeler" : NomProc(args) seul sur la ligne
       (aucun opérateur d'affectation après la parenthèse fermante). À
       distinguer de l'affectation ci-dessous, qui exige "<-"/"=" après. */
    if(isIdentToken(tokens[0]) && tokens[1] === '('){
      const close = findMatchingBracket(tokens, 1);
      if(close !== -1 && close === tokens.length - 1){
        const argTokens = tokens.slice(2, close);
        const args = argTokens.length ? splitTopLevelCommas(argTokens).map((g) => parseExprTokens(g, line.num)) : [];
        return { type:'AppelProcedure', name: tokens[0], args, line: line.num };
      }
    }

    /* Affectation : nom [ '[' expr ']' ] ('<-'|'=') expression */
    const name = tokens[0];
    if(!isIdentToken(name)) throw new PseudoError(`Instruction non reconnue : "${tokens.join(' ')}"`, line.num);
    let pos = 1, indexExpr = null;
    if(tokens[1] === '['){
      const close = findMatchingBracket(tokens, 1);
      if(close === -1) throw new PseudoError('Crochet non fermé.', line.num);
      indexExpr = parseExprTokens(tokens.slice(2, close), line.num);
      pos = close + 1;
    }
    const opTok = tokens[pos];
    const eqAllowed = this.config.allowEqualsForAssign !== false; // true par défaut
    if(opTok === '=' && !eqAllowed){
      throw new PseudoError(`L'opérateur "=" n'est pas autorisé pour l'affectation dans cette configuration. Utilisez "<-".`, line.num);
    }
    if(opTok !== '<-' && opTok !== '=') throw new PseudoError(`Instruction non reconnue : "${tokens.join(' ')}"`, line.num);
    const rhs = tokens.slice(pos + 1);
    if(rhs.length === 0) throw new PseudoError('Expression manquante après l\'affectation.', line.num);
    return { type:'Affect', name, indexExpr, expr: parseExprTokens(rhs, line.num), line: line.num };
  }
}

/* ============================================================
   ENVIRONNEMENT D'EXÉCUTION
   ============================================================ */
class Env{
  constructor(){ this.vars = new Map(); }
  declareScalar(name, type){ this.vars.set(name, { type, value: defaultForType(type) }); }
  declareArray(name, size, base){ this.vars.set(name, { type:'tableau', base, size, value: new Array(size).fill(defaultForType(base)) }); }
  has(name){ return this.vars.has(name); }
  getEntry(name, line){
    if(!this.vars.has(name)) throw new PseudoError(`Variable "${name}" non déclarée.`, line);
    return this.vars.get(name);
  }
  get(name, line){ return this.getEntry(name, line).value; }
  set(name, value, line){ const e = this.getEntry(name, line); e.value = value; }
  setIndex(name, idx, value, line){
    const e = this.getEntry(name, line);
    if(e.type !== 'tableau') throw new PseudoError(`"${name}" n'est pas un tableau.`, line);
    if(!Number.isInteger(idx) || idx < 0 || idx >= e.size)
      throw new PseudoError(`Indice ${idx} hors limites pour le tableau "${name}" (taille ${e.size}, indices valides de 0 à ${e.size - 1}).`, line);
    e.value[idx] = value;
  }
}

function truthy(v){
  if(typeof v === 'boolean') return v;
  if(typeof v === 'number') return v !== 0;
  return !!v;
}
function compareEq(l, r){
  if(typeof l === 'number' && typeof r === 'number') return l === r;
  if(typeof l === 'boolean' || typeof r === 'boolean') return truthy(l) === truthy(r);
  return String(l) === String(r);
}

/* Fonctions intégrées du langage, utilisables dans toute expression :
   Ord(car) ... FinSelon, Ecrire(Ord("A")), etc. Le registre est conçu pour
   être facilement étendu (ex. Car/Chr, Longueur) sans toucher au parseur. */
const BUILTIN_FUNCTIONS = {
  ord(args, line, name){
    if(args.length !== 1) throw new PseudoError(`"${name}" attend exactement 1 argument (reçu ${args.length}).`, line);
    const v = args[0];
    if(typeof v !== 'string') throw new PseudoError(`"${name}" attend une chaîne de caractères (un caractère), pas ${typeof v === 'boolean' ? 'un booléen' : 'un nombre'}.`, line);
    if(v.length === 0) throw new PseudoError(`"${name}" attend un caractère non vide.`, line);
    return v.codePointAt(0);
  },
};

async function evalExpr(node, env, line, interp){
  switch(node.type){
    case 'Num': return node.value;
    case 'Str': return node.value;
    case 'Bool': return node.value;
    case 'Var': return env.get(node.name, line);
    case 'Index': {
      const entry = env.getEntry(node.name, line);
      if(entry.type !== 'tableau') throw new PseudoError(`"${node.name}" n'est pas un tableau.`, line);
      const i = Math.trunc(await evalExpr(node.index, env, line, interp));
      if(!Number.isInteger(i) || i < 0 || i >= entry.size)
        throw new PseudoError(`Indice ${i} hors limites pour le tableau "${node.name}" (taille ${entry.size}, indices valides de 0 à ${entry.size - 1}).`, line);
      return entry.value[i];
    }
    case 'Call': {
      const key = KW(node.name);
      const argValues = [];
      for(const a of node.args) argValues.push(await evalExpr(a, env, line, interp));

      const builtin = BUILTIN_FUNCTIONS[key];
      if(builtin) return builtin(argValues, line, node.name);

      if(interp && interp.functions && interp.functions[key]){
        return await interp.callFunction(key, argValues, line);
      }
      if(interp && interp.procedures && interp.procedures[key]){
        throw new PseudoError(`"${node.name}" est une procédure : elle ne renvoie pas de valeur et ne peut pas être utilisée dans une expression. Utilisez une Fonction, ou "Appeler ${node.name}(...)" comme instruction séparée.`, line);
      }
      throw new PseudoError(`Fonction "${node.name}" inconnue.`, line);
    }
    case 'Un': {
      const v = await evalExpr(node.expr, env, line, interp);
      if(node.op === '-') return -Number(v);
      if(node.op === '+') return +Number(v);
      if(node.op === 'non') return !truthy(v);
      throw new PseudoError(`Opérateur unaire inconnu "${node.op}".`, line);
    }
    case 'Bin': {
      if(node.op === 'et') return truthy(await evalExpr(node.left, env, line, interp)) ? truthy(await evalExpr(node.right, env, line, interp)) : false;
      if(node.op === 'ou') return truthy(await evalExpr(node.left, env, line, interp)) ? true : truthy(await evalExpr(node.right, env, line, interp));
      const l = await evalExpr(node.left, env, line, interp);
      const r = await evalExpr(node.right, env, line, interp);
      switch(node.op){
        case '+': return (typeof l === 'string' || typeof r === 'string') ? String(l) + String(r) : (Number(l) + Number(r));
        case '-': return Number(l) - Number(r);
        case '*': return Number(l) * Number(r);
        case '/': if(Number(r) === 0) throw new PseudoError('Division par zéro.', line); return Number(l) / Number(r);
        case '%': case 'mod': if(Number(r) === 0) throw new PseudoError('Division par zéro (Mod).', line); return Number(l) % Number(r);
        case 'div': if(Number(r) === 0) throw new PseudoError('Division par zéro (Div).', line); return Math.trunc(Number(l) / Number(r));
        case '&': return String(l) + String(r);
        case '=': return compareEq(l, r);
        case '<>': return !compareEq(l, r);
        case '<': return (typeof l === 'number' && typeof r === 'number') ? l < r : String(l) < String(r);
        case '>': return (typeof l === 'number' && typeof r === 'number') ? l > r : String(l) > String(r);
        case '<=': return (typeof l === 'number' && typeof r === 'number') ? l <= r : String(l) <= String(r);
        case '>=': return (typeof l === 'number' && typeof r === 'number') ? l >= r : String(l) >= String(r);
        default: throw new PseudoError(`Opérateur inconnu "${node.op}".`, line);
      }
    }
    default: throw new PseudoError('Expression invalide.', line);
  }
}

function formatValue(v){
  if(typeof v === 'boolean') return v ? 'Vrai' : 'Faux';
  return String(v);
}
function parseInputValue(raw, type, name, line){
  const t = raw.trim();
  switch(type){
    case 'entier':
      if(!/^-?\d+$/.test(t)) throw new PseudoError(`Entrée invalide pour "${name}" : un entier est attendu.`, line);
      return parseInt(t, 10);
    case 'reel': {
      const n = Number(t.replace(',', '.'));
      if(Number.isNaN(n)) throw new PseudoError(`Entrée invalide pour "${name}" : un nombre est attendu.`, line);
      return n;
    }
    case 'booleen': {
      const k = KW(t);
      if(['vrai', 'true', '1', 'oui'].includes(k)) return true;
      if(['faux', 'false', '0', 'non'].includes(k)) return false;
      throw new PseudoError(`Entrée invalide pour "${name}" : Vrai ou Faux attendu.`, line);
    }
    default: return t;
  }
}
function sleep0(){ return new Promise(r => setTimeout(r, 0)); }

/* ============================================================
   INTERPRÉTEUR
   ============================================================ */
/* Déduit un type de variable pédagogique à partir d'une valeur JS,
   utilisé uniquement quand strictMode est désactivé (voir INSTITUTION_CONFIG). */
function inferType(value){
  if(typeof value === 'boolean') return 'booleen';
  if(typeof value === 'number') return Number.isInteger(value) ? 'entier' : 'reel';
  return 'chaine';
}

class Interpreter{
  constructor(io, config = {}, signal = null){
    this.io = io;
    this.env = new Env();
    this.steps = 0;
    this.maxSteps = 2000000; // 2 millions d'opérations (protection boucle infinie)
    this.config = config;
    // Objet partagé par référence avec l'UI ({ stopped: false }) : cocher
    // "stopped" à true depuis l'extérieur (bouton "Arrêter") interrompt
    // proprement l'exécution au prochain point de contrôle.
    this.signal = signal;
    // Tables des Fonctions/Procédures déclarées dans le programme (clé =
    // nom normalisé via KW), peuplées au début de run().
    this.functions = {};
    this.procedures = {};
  }

  async run(program){
    this.functions = program.functions || {};
    this.procedures = program.procedures || {};
    for(const decl of program.declarations){
      if(decl.kind === 'scalar') this.env.declareScalar(decl.name, decl.type);
      else this.env.declareArray(decl.name, decl.size, decl.base);
    }
    try{
      await this.execBlock(program.body);
    } catch(e){
      if(e instanceof ReturnSignal){
        // "Retourner" utilisé hors de toute Fonction/Procédure : erreur
        // pédagogique claire plutôt qu'un plantage silencieux.
        throw new PseudoError('"Retourner" ne peut être utilisé qu\'à l\'intérieur d\'une Fonction ou d\'une Procédure.', e.line);
      }
      throw e;
    }
  }

  async execBlock(block){ for(const stmt of block) await this.execStmt(stmt); }

  bumpSteps(line){
    if(this.signal && this.signal.stopped) throw new StopRequested("Exécution arrêtée par l'utilisateur.");
    this.steps++;
    if(this.steps > this.maxSteps) throw new PseudoError("Nombre maximal d'opérations dépassé (boucle infinie ?).", line);
  }

  /* Exécute le corps d'une Fonction/Procédure dans un environnement local
     isolé (paramètres + variables locales), puis restaure l'environnement
     appelant. `isFuncCall` détermine si une valeur de retour est exigée. */
  async invokeCallable(decl, argValues, line, isFuncCall){
    if(argValues.length !== decl.params.length){
      throw new PseudoError(`"${decl.name}" attend ${decl.params.length} argument(s), reçu ${argValues.length}.`, line);
    }

    const callEnv = new Env();
    decl.params.forEach((paramName, i) => {
      callEnv.declareScalar(paramName, inferType(argValues[i]));
      callEnv.set(paramName, argValues[i], line);
    });
    for(const d of decl.localDecls){
      if(d.kind === 'scalar') callEnv.declareScalar(d.name, d.type);
      else callEnv.declareArray(d.name, d.size, d.base);
    }

    const savedEnv = this.env;
    this.env = callEnv;
    let returnValue;
    let didReturn = false;
    try{
      await this.execBlock(decl.body);
    } catch(e){
      if(e instanceof ReturnSignal){ returnValue = e.value; didReturn = true; }
      else { this.env = savedEnv; throw e; }
    }
    this.env = savedEnv;

    if(isFuncCall && !didReturn){
      throw new PseudoError(`La fonction "${decl.name}" doit se terminer par "Retourner" (aucune valeur n'a été renvoyée).`, line);
    }
    return returnValue;
  }

  async callFunction(key, argValues, line){
    return this.invokeCallable(this.functions[key], argValues, line, true);
  }
  async callProcedure(key, argValues, line){
    return this.invokeCallable(this.procedures[key], argValues, line, false);
  }

  async execStmt(stmt){
    this.bumpSteps(stmt.line);
    switch(stmt.type){
      case 'Affect': {
        const val = await evalExpr(stmt.expr, this.env, stmt.line, this);
        if(stmt.indexExpr){
          // Un tableau doit toujours être déclaré au préalable (sa taille est
          // nécessaire) : strictMode ne s'applique pas ici.
          const idx = Math.trunc(await evalExpr(stmt.indexExpr, this.env, stmt.line, this));
          this.env.setIndex(stmt.name, idx, val, stmt.line);
        } else {
          if(!this.env.has(stmt.name) && !this.config.strictMode){
            // Mode non strict (par défaut) : déclaration implicite à la première
            // affectation, type déduit de la valeur assignée.
            this.env.declareScalar(stmt.name, inferType(val));
          }
          this.env.set(stmt.name, val, stmt.line);
        }
        break;
      }
      case 'Ecrire': {
        const parts = [];
        for(const a of stmt.args) parts.push(formatValue(await evalExpr(a, this.env, stmt.line, this)));
        this.io.write(parts.join(''));
        break;
      }
      case 'Lire': {
        const raw = await this.io.readLine();
        if(stmt.indexExpr){
          const entry = this.env.getEntry(stmt.name, stmt.line);
          const idx = Math.trunc(await evalExpr(stmt.indexExpr, this.env, stmt.line, this));
          const val = parseInputValue(raw, entry.base, stmt.name, stmt.line);
          this.env.setIndex(stmt.name, idx, val, stmt.line);
        } else {
          const entry = this.env.getEntry(stmt.name, stmt.line);
          const val = parseInputValue(raw, entry.type, stmt.name, stmt.line);
          this.env.set(stmt.name, val, stmt.line);
        }
        break;
      }
      case 'Si': {
        if(truthy(await evalExpr(stmt.cond, this.env, stmt.line, this))){
          await this.execBlock(stmt.then);
        } else {
          let handled = false;
          if(stmt.elifs){
            for(const branch of stmt.elifs){
              if(truthy(await evalExpr(branch.cond, this.env, stmt.line, this))){
                await this.execBlock(branch.block);
                handled = true;
                break;
              }
            }
          }
          if(!handled && stmt.else) await this.execBlock(stmt.else);
        }
        break;
      }
      case 'Pour': {
        const from = Math.trunc(await evalExpr(stmt.from, this.env, stmt.line, this));
        const to = Math.trunc(await evalExpr(stmt.to, this.env, stmt.line, this));
        const step = stmt.step ? Math.trunc(await evalExpr(stmt.step, this.env, stmt.line, this)) : 1;
        if(step === 0) throw new PseudoError('Le "Pas" de la boucle "Pour" ne peut pas être 0.', stmt.line);
        if(!this.env.has(stmt.varName)) this.env.declareScalar(stmt.varName, 'entier');
        for(let i = from; step > 0 ? i <= to : i >= to; i += step){
          this.env.set(stmt.varName, i, stmt.line);
          await this.execBlock(stmt.body);
          this.bumpSteps(stmt.line);
          if(this.steps % 1000 === 0) await sleep0();
        }
        break;
      }
      case 'TantQue': {
        while(truthy(await evalExpr(stmt.cond, this.env, stmt.line, this))){
          await this.execBlock(stmt.body);
          this.bumpSteps(stmt.line);
          if(this.steps % 1000 === 0) await sleep0();
        }
        break;
      }
      case 'Repeter': {
        // Boucle à post-condition : le corps s'exécute au moins une fois,
        // puis se répète TANT QUE la condition de "Jusqu'à" est fausse.
        do{
          await this.execBlock(stmt.body);
          this.bumpSteps(stmt.line);
          if(this.steps % 1000 === 0) await sleep0();
        } while(!truthy(await evalExpr(stmt.cond, this.env, stmt.line, this)));
        break;
      }
      case 'Selon': {
        const switchVal = await evalExpr(stmt.expr, this.env, stmt.line, this);
        let matched = false;
        for(const c of stmt.cases){
          const caseVal = await evalExpr(c.value, this.env, stmt.line, this);
          if(compareEq(switchVal, caseVal)){
            await this.execBlock(c.block);
            matched = true;
            break;
          }
        }
        if(!matched && stmt.default) await this.execBlock(stmt.default);
        break;
      }
      case 'AppelProcedure': {
        const key = KW(stmt.name);
        const argValues = [];
        for(const a of stmt.args) argValues.push(await evalExpr(a, this.env, stmt.line, this));

        if(this.procedures[key]){ await this.callProcedure(key, argValues, stmt.line); break; }
        if(this.functions[key]){ await this.callFunction(key, argValues, stmt.line); break; } // résultat ignoré
        const builtin = BUILTIN_FUNCTIONS[key];
        if(builtin){ builtin(argValues, stmt.line, stmt.name); break; } // résultat ignoré
        throw new PseudoError(`"${stmt.name}" n'est ni une procédure ni une fonction connue.`, stmt.line);
      }
      case 'Retourner': {
        const value = stmt.expr ? await evalExpr(stmt.expr, this.env, stmt.line, this) : undefined;
        throw new ReturnSignal(value, stmt.line);
      }
      default:
        throw new PseudoError('Instruction inconnue.', stmt.line);
    }
  }
}

/* ============================================================
   INTERFACE UTILISATEUR
   ============================================================ */
const codeEl = document.getElementById('code');
const gutterEl = document.getElementById('gutter');
const highlightEl = document.getElementById('highlight');
const highlightCodeEl = document.getElementById('highlightCode');
const autocompleteEl = document.getElementById('autocomplete');
const lineCountEl = document.getElementById('lineCount');
const consoleEl = document.getElementById('console');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const brandLogoEl = document.getElementById('brandLogo');
const brandSubtitleEl = document.getElementById('brandSubtitle');
const devCreditEl = document.getElementById('devCredit');

// Boutons Exécuter / Arrêter dupliqués (barre d'outils rapide + menu Exécution) :
// on les pilote tous ensemble via ces listes plutôt que par un id unique.
const runTriggers = () => document.querySelectorAll('.run-trigger');
const stopTriggers = () => document.querySelectorAll('.stop-trigger');

const fileInputEl = document.getElementById('fileInput');
const printAreaEl = document.getElementById('printArea');
const menuExamplesEl = document.getElementById('menuExamples');
const fontSizeGroupEl = document.getElementById('fontSizeGroup');
const themeGroupEl = document.getElementById('themeGroup');
const toggleLineNumbersEl = document.getElementById('toggleLineNumbers');
const modalOverlayEl = document.getElementById('modalOverlay');
const modalTitleEl = document.getElementById('modalTitle');
const modalBodyEl = document.getElementById('modalBody');
const modalCloseEl = document.getElementById('modalClose');

let isRunning = false;
// Signal partagé avec l'Interpreter en cours ({ stopped: false }) : le
// bouton "Arrêter" le passe à true, vérifié à chaque instruction exécutée.
let runSignal = null;
// Référence vers la saisie Lire() actuellement en attente dans la console,
// pour pouvoir l'annuler proprement si l'utilisateur clique sur "Arrêter"
// pendant qu'une valeur est demandée.
let pendingInput = null;
let lineNumbersVisible = true;

/* ---------- Branding & configuration institutionnelle ----------
   Toute personnalisation (nom de l'université, cours, couleur, mode
   pédagogique, exercices) provient exclusivement d'INSTITUTION_CONFIG,
   défini en tête de fichier. Rien ici ne doit être modifié pour changer
   l'établissement : seul le bloc de configuration doit l'être. */
function applyInstitutionConfig(config){
  document.documentElement.style.setProperty('--accent', config.accentColor || '#f2a93c');
  brandLogoEl.textContent = config.logoText || 'SOFT-KEY';
  brandSubtitleEl.textContent = `${config.courseTitle || ''}${config.courseTitle && config.universityName ? ' — ' : ''}${config.universityName || ''}`;
  document.title = `${config.logoText || 'SOFT-KEY'} — ${config.courseTitle || 'Interpréteur de pseudo-code'}`;
  // La signature du développeur reste toujours affichée (même si un
  // établissement personnalise logoText/universityName pour son propre cours).
  // Priorité à 'credits' (texte libre) ; à défaut, composé à partir de
  // 'developer' et 'aiPowered'.
  if(config.credits){
    devCreditEl.textContent = config.credits;
  } else {
    const dev = config.developer || 'SOFT-KEY';
    devCreditEl.textContent = config.aiPowered
      ? `Développé par ${dev} avec l'assistance de l'IA`
      : `Développé par ${dev}`;
  }
}

function buildExampleMenu(config){
  const examples = config.examples || {};
  menuExamplesEl.innerHTML = '';
  for(const [key, ex] of Object.entries(examples)){
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'menu-item';
    btn.textContent = ex.label || key;
    btn.addEventListener('click', () => { loadExample(key); closeAllMenus(); });
    menuExamplesEl.appendChild(btn);
  }
}

function loadExample(key){
  const ex = INSTITUTION_CONFIG.examples && INSTITUTION_CONFIG.examples[key];
  if(!ex) return;
  codeEl.value = ex.code;
  hideAutocomplete();
  onCodeChanged();
  clearConsole();
  setStatus('ready');
}

/* ============================================================
   COLORATION SYNTAXIQUE
   ------------------------------------------------------------
   Fonction pure : source (string) -> HTML coloré (string). Reconstruit le
   texte caractère par caractère (mêmes espaces, mêmes retours à la ligne)
   afin que la couche colorée reste pixel-parfaitement alignée avec le
   <textarea> transparent posé au-dessus.
   ============================================================ */
const HL_CONTROL_KEYWORDS = new Set([
  'algorithme', 'variables', 'debut', 'fin',
  'si', 'alors', 'sinonsi', 'sinon', 'finsi',
  'selon', 'cas', 'autrement', 'finselon',
  'pour', 'de', 'a', 'pas', 'faire', 'finpour',
  'tantque', 'fintantque', 'repeter', "jusqu'a",
  'lire', 'ecrire',
  'fonction', 'finfonction', 'procedure', 'finprocedure',
  'retourner', 'retourne', 'appeler',
]);
const HL_LOGIC_WORDS = new Set(['et', 'ou', 'non', 'mod', 'div']);
const HL_BOOL_WORDS = new Set(['vrai', 'faux']);
const HL_TYPE_WORDS = new Set(['entier', 'reel', 'chaine', 'booleen', 'caractere', 'tableau']);
// Fonctions intégrées (Ord, et futures extensions) : reflète les clés de
// BUILTIN_FUNCTIONS, pour que la coloration reste toujours synchronisée
// avec ce que le moteur reconnaît réellement.
const HL_FUNC_WORDS = new Set(['ord']);

const HL_RE = /(\/\/[^\n]*)|("[^"\n]*")|('[^'\n]*')|([A-Za-zÀ-ÖØ-öø-ÿ_]+'[A-Za-zÀ-ÖØ-öø-ÿ_]+)|(\d+\.\d+|\d+)|([A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*)|(<-|<>|<=|>=|[+\-*/%=<>()\[\],:&])|([ \t]+)|(\r?\n)|([^\s])/g;

function escapeHtml(s){
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function classifyWord(word){
  const k = KW(word);
  if(HL_CONTROL_KEYWORDS.has(k)) return 'tok-kw';
  if(HL_LOGIC_WORDS.has(k)) return 'tok-logic';
  if(HL_BOOL_WORDS.has(k)) return 'tok-bool';
  if(HL_TYPE_WORDS.has(k)) return 'tok-type';
  if(HL_FUNC_WORDS.has(k)) return 'tok-func';
  return null;
}

function highlightCode(source){
  let html = '';
  HL_RE.lastIndex = 0;
  let m;
  while((m = HL_RE.exec(source))){
    if(m[1] !== undefined){ html += `<span class="tok-com">${escapeHtml(m[1])}</span>`; }
    else if(m[2] !== undefined || m[3] !== undefined){ html += `<span class="tok-str">${escapeHtml(m[2] || m[3])}</span>`; }
    else if(m[4] !== undefined){
      const cls = classifyWord(m[4]);
      html += cls ? `<span class="${cls}">${escapeHtml(m[4])}</span>` : escapeHtml(m[4]);
    }
    else if(m[5] !== undefined){ html += `<span class="tok-num">${escapeHtml(m[5])}</span>`; }
    else if(m[6] !== undefined){
      const cls = classifyWord(m[6]);
      html += cls ? `<span class="${cls}">${escapeHtml(m[6])}</span>` : escapeHtml(m[6]);
    }
    else if(m[7] !== undefined){ html += `<span class="tok-op">${escapeHtml(m[7])}</span>`; }
    else { html += escapeHtml(m[8] || m[9] || m[10]); }
  }
  return html;
}

/* ============================================================
   AUTOCOMPLÉTION
   ------------------------------------------------------------
   Suggère les mots-clés du langage ainsi que les identifiants déjà
   présents dans le code (variables déclarées, variables de boucle,
   cibles d'affectation) — repérage heuristique, volontairement plus
   souple que le Parser, uniquement à but d'aide à la saisie.
   ============================================================ */
const AC_KEYWORDS = [
  'Algorithme', 'Variables', 'Début', 'Fin',
  'Si', 'Alors', 'SinonSi', 'Sinon', 'FinSi',
  'Selon', 'Cas', 'Autrement', 'FinSelon',
  'Pour', 'De', 'À', 'Pas', 'Faire', 'FinPour',
  'TantQue', 'FinTantQue',
  'Répéter', "Jusqu'à",
  'Lire', 'Ecrire', 'Ord',
  'Fonction', 'FinFonction', 'Procédure', 'FinProcédure',
  'Retourner', 'Appeler',
  'Et', 'Ou', 'Non', 'Mod', 'Div', 'Vrai', 'Faux',
  'Entier', 'Réel', 'Chaîne', 'Booléen', 'Caractère', 'Tableau', 'de',
];

let acItems = [];
let acSelectedIndex = 0;
let acWordStart = 0;

function extractKnownIdentifiers(source){
  const names = new Set();
  const declRe = /([A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*)\s*:/g;
  const pourRe = /\bPour\s+([A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*)\s+De\b/gi;
  const affRe = /([A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*)\s*(?:<-|=)/g;
  let m;
  while((m = declRe.exec(source))) names.add(m[1]);
  while((m = pourRe.exec(source))) names.add(m[1]);
  while((m = affRe.exec(source))) names.add(m[1]);
  return [...names].filter((n) => {
    const k = KW(n);
    return !HL_CONTROL_KEYWORDS.has(k) && !HL_TYPE_WORDS.has(k) && !HL_LOGIC_WORDS.has(k) && !HL_BOOL_WORDS.has(k) && !HL_FUNC_WORDS.has(k);
  });
}

function getSuggestions(prefix, source){
  const p = KW(prefix);
  if(!p) return [];
  const seen = new Set();
  const out = [];
  for(const v of extractKnownIdentifiers(source)){
    const k = KW(v);
    if(k === p || !k.startsWith(p)) continue;
    if(seen.has('v:' + k)) continue;
    seen.add('v:' + k);
    out.push({ text: v, kind: 'var' });
  }
  for(const kw of AC_KEYWORDS){
    const k = KW(kw);
    if(k === p || !k.startsWith(p)) continue;
    if(seen.has('k:' + k)) continue;
    seen.add('k:' + k);
    out.push({ text: kw, kind: 'kw' });
  }
  return out.slice(0, 8);
}

/* Position pixel du curseur dans le textarea, via la technique classique du
   "miroir" : un élément invisible reproduit exactement la mise en forme du
   texte jusqu'au curseur, et l'on mesure la position d'un repère à cet
   endroit. */
function getCaretCoordinates(el, position){
  const div = document.createElement('div');
  const style = getComputedStyle(el);
  const props = [
    'boxSizing', 'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing',
    'lineHeight', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'tabSize',
  ];
  for(const p of props) div.style[p] = style[p];
  div.style.position = 'absolute';
  div.style.visibility = 'hidden';
  div.style.whiteSpace = 'pre';
  div.style.width = el.clientWidth + 'px';
  div.style.height = 'auto';
  document.body.appendChild(div);

  div.textContent = el.value.substring(0, position);
  const span = document.createElement('span');
  span.textContent = el.value.substring(position) || '.';
  div.appendChild(span);

  const coords = {
    left: span.offsetLeft,
    top: span.offsetTop,
    height: parseFloat(style.lineHeight) || span.offsetHeight,
  };
  document.body.removeChild(div);
  return coords;
}

function hideAutocomplete(){
  autocompleteEl.hidden = true;
  autocompleteEl.innerHTML = '';
  acItems = [];
  acSelectedIndex = 0;
}

function renderAutocompleteSelection(){
  [...autocompleteEl.children].forEach((li, idx) => {
    li.classList.toggle('active', idx === acSelectedIndex);
    if(idx === acSelectedIndex) li.scrollIntoView({ block: 'nearest' });
  });
}

function applySuggestion(){
  if(!acItems.length) return;
  const item = acItems[acSelectedIndex];
  const pos = codeEl.selectionStart;
  const value = codeEl.value;
  const before = value.slice(0, acWordStart);
  const after = value.slice(pos);
  codeEl.value = before + item.text + after;
  const newPos = before.length + item.text.length;
  codeEl.selectionStart = codeEl.selectionEnd = newPos;
  hideAutocomplete();
  onCodeChanged();
  codeEl.focus();
}

function showAutocomplete(items, coords){
  autocompleteEl.innerHTML = '';
  items.forEach((item, idx) => {
    const li = document.createElement('li');
    li.className = 'ac-item' + (idx === acSelectedIndex ? ' active' : '');
    li.setAttribute('role', 'option');

    const label = document.createElement('span');
    label.className = 'ac-label';
    label.textContent = item.text;

    const tag = document.createElement('span');
    tag.className = 'ac-tag ac-tag-' + item.kind;
    tag.textContent = item.kind === 'var' ? 'variable' : 'mot-clé';

    li.appendChild(label);
    li.appendChild(tag);
    li.addEventListener('mousedown', (e) => {
      e.preventDefault(); // garde le focus sur le textarea (évite le blur)
      acSelectedIndex = idx;
      applySuggestion();
    });
    autocompleteEl.appendChild(li);
  });

  const wrapWidth = codeEl.parentElement.clientWidth;
  const wrapHeight = codeEl.parentElement.clientHeight;
  let left = coords.left;
  let top = coords.top;
  if(left + 260 > wrapWidth) left = Math.max(0, wrapWidth - 260);
  if(top + 220 > wrapHeight) top = Math.max(0, coords.top - coords.height - 220);

  autocompleteEl.style.left = left + 'px';
  autocompleteEl.style.top = top + 'px';
  autocompleteEl.hidden = false;
}

function updateAutocomplete(){
  const pos = codeEl.selectionStart;
  if(pos !== codeEl.selectionEnd){ hideAutocomplete(); return; }
  const value = codeEl.value;
  const textBefore = value.slice(0, pos);
  const match = /[A-Za-zÀ-ÖØ-öø-ÿ_][A-Za-zÀ-ÖØ-öø-ÿ0-9_]*$/.exec(textBefore);
  if(!match){ hideAutocomplete(); return; }

  acWordStart = pos - match[0].length;
  const items = getSuggestions(match[0], value);
  if(!items.length){ hideAutocomplete(); return; }

  acItems = items;
  acSelectedIndex = 0;
  const caret = getCaretCoordinates(codeEl, pos);
  showAutocomplete(items, {
    left: caret.left - codeEl.scrollLeft,
    top: caret.top - codeEl.scrollTop + caret.height,
  });
}

/* ============================================================
   GUTTER + SYNCHRONISATION DES COUCHES
   ============================================================ */
function syncOverlayScroll(){
  gutterEl.scrollTop = codeEl.scrollTop;
  highlightEl.scrollTop = codeEl.scrollTop;
  highlightEl.scrollLeft = codeEl.scrollLeft;
}

function updateGutter(){
  // Une ligne = un élément du tableau retourné par split('\n'), y compris
  // la ligne vide finale, ce qui garantit une correspondance 1:1 avec les
  // lignes réellement affichées dans le <textarea> (white-space: pre).
  const lines = codeEl.value.split('\n');
  const n = lines.length;

  const frag = document.createDocumentFragment();
  for(let i = 1; i <= n; i++){
    const span = document.createElement('span');
    span.textContent = String(i);
    frag.appendChild(span);
  }
  gutterEl.replaceChildren(frag);
  lineCountEl.textContent = n === 1 ? '1 ligne' : `${n} lignes`;
}

function updateHighlight(){
  highlightCodeEl.innerHTML = highlightCode(codeEl.value);
}

function onCodeChanged(){
  updateGutter();
  updateHighlight();
  syncOverlayScroll();
}

// Saisie clavier normale
codeEl.addEventListener('input', () => { onCodeChanged(); updateAutocomplete(); });
// Couper / coller peuvent changer le nombre de lignes après l'événement 'input'
// sur certains navigateurs : on force une resynchronisation à la frame suivante.
codeEl.addEventListener('paste', () => requestAnimationFrame(onCodeChanged));
codeEl.addEventListener('cut', () => requestAnimationFrame(onCodeChanged));
// Défilement : le gutter et la couche colorée suivent toujours exactement le textarea.
codeEl.addEventListener('scroll', () => { syncOverlayScroll(); hideAutocomplete(); }, { passive: true });
// Le redimensionnement de la fenêtre peut changer le retour à la ligne / la hauteur visible.
window.addEventListener('resize', syncOverlayScroll);
// Le curseur peut se déplacer sans saisie (souris, flèches) : on garde
// l'autocomplétion synchronisée avec le mot sous le curseur.
codeEl.addEventListener('click', hideAutocomplete);
codeEl.addEventListener('blur', hideAutocomplete);
codeEl.addEventListener('keyup', (e) => {
  if(['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) updateAutocomplete();
});

codeEl.addEventListener('keydown', (e) => {
  if(!autocompleteEl.hidden){
    if(e.key === 'ArrowDown'){ e.preventDefault(); acSelectedIndex = (acSelectedIndex + 1) % acItems.length; renderAutocompleteSelection(); return; }
    if(e.key === 'ArrowUp'){ e.preventDefault(); acSelectedIndex = (acSelectedIndex - 1 + acItems.length) % acItems.length; renderAutocompleteSelection(); return; }
    if(e.key === 'Enter' || e.key === 'Tab'){ e.preventDefault(); applySuggestion(); return; }
    if(e.key === 'Escape'){ e.preventDefault(); hideAutocomplete(); return; }
  }
  if(e.key === 'Tab'){
    e.preventDefault();
    const s = codeEl.selectionStart, en = codeEl.selectionEnd;
    codeEl.value = codeEl.value.slice(0, s) + '    ' + codeEl.value.slice(en);
    codeEl.selectionStart = codeEl.selectionEnd = s + 4;
    onCodeChanged();
  }
  if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){ e.preventDefault(); hideAutocomplete(); runCode(); }
});

function setStatus(state){
  statusDot.className = 'status-dot ' + state;
  statusText.textContent = { ready:'Prêt', running:'Exécution…', done:'Terminé', error:'Erreur', stopped:'Arrêté' }[state] || state;
}

function scrollConsole(){ consoleEl.scrollTop = consoleEl.scrollHeight; }
function appendOutput(text, cls){
  const span = document.createElement('span');
  if(cls) span.className = cls;
  span.textContent = text + '\n';
  consoleEl.appendChild(span);
  scrollConsole();
}
function appendError(text){ appendOutput(text, 'err'); }
function appendSystem(text){ appendOutput(text, 'sys'); }
function clearConsole(){ consoleEl.innerHTML = ''; }

function waitForInput(){
  return new Promise((resolve, reject) => {
    const wrap = document.createElement('span');
    wrap.className = 'inline-read';
    const caret = document.createElement('span');
    caret.className = 'caret-mark';
    caret.textContent = '→ ';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-input';
    input.autocomplete = 'off';
    input.spellcheck = false;
    wrap.appendChild(caret);
    wrap.appendChild(input);
    consoleEl.appendChild(wrap);
    scrollConsole();
    input.focus();
    const submit = () => {
      const val = input.value;
      pendingInput = null;
      wrap.remove();
      const echo = document.createElement('span');
      echo.className = 'userinput';
      echo.textContent = '→ ' + val + '\n';
      consoleEl.appendChild(echo);
      scrollConsole();
      resolve(val);
    };
    input.addEventListener('keydown', (e) => { if(e.key === 'Enter'){ e.preventDefault(); submit(); } });
    // Permet à requestStop() d'annuler cette saisie en attente si l'utilisateur
    // clique sur "Arrêter" pendant qu'une valeur Lire() est demandée.
    pendingInput = { wrap, reject };
  });
}

function requestStop(){
  if(!isRunning || !runSignal) return;
  runSignal.stopped = true;
  stopTriggers().forEach((b) => { b.disabled = true; }); // évite les double-clics pendant que ça s'arrête
  if(pendingInput){
    // Une saisie Lire() est en cours : on l'annule immédiatement plutôt que
    // d'attendre que l'utilisateur tape quelque chose.
    const { wrap, reject } = pendingInput;
    pendingInput = null;
    wrap.remove();
    reject(new StopRequested("Exécution arrêtée par l'utilisateur."));
  }
}
stopTriggers().forEach((b) => b.addEventListener('click', requestStop));

async function runCode(){
  if(isRunning) return;
  hideAutocomplete();
  closeAllMenus();
  clearConsole();
  runTriggers().forEach((b) => { b.disabled = true; });
  stopTriggers().forEach((b) => { b.disabled = false; });
  isRunning = true;
  runSignal = { stopped: false };
  setStatus('running');

  let program;
  try{
    const lines = preprocess(codeEl.value);
    program = new Parser(lines, INSTITUTION_CONFIG).parseProgram();
  } catch(err){
    const line = err instanceof PseudoError ? err.line : undefined;
    appendError(`Erreur de syntaxe${line ? ' (ligne ' + line + ')' : ''} : ${err.message}`);
    setStatus('error');
    isRunning = false;
    runTriggers().forEach((b) => { b.disabled = false; });
    stopTriggers().forEach((b) => { b.disabled = true; });
    return;
  }

  try{
    const interp = new Interpreter({ write: appendOutput, readLine: waitForInput }, INSTITUTION_CONFIG, runSignal);
    await interp.run(program);
    appendSystem('✓ Exécution terminée sans erreur.');
    setStatus('done');
  } catch(err){
    if(err instanceof StopRequested){
      appendOutput('⏹ ' + err.message, 'stop');
      setStatus('stopped');
    } else if(err instanceof PseudoError){
      appendError(`Erreur d'exécution${err.line ? ' (ligne ' + err.line + ')' : ''} : ${err.message}`);
      setStatus('error');
    } else {
      appendError('Erreur inattendue : ' + err.message);
      console.error(err);
      setStatus('error');
    }
  } finally{
    isRunning = false;
    runTriggers().forEach((b) => { b.disabled = false; });
    stopTriggers().forEach((b) => { b.disabled = true; });
    runSignal = null;
    pendingInput = null;
  }
}
runTriggers().forEach((b) => b.addEventListener('click', runCode));

/* ============================================================
   BARRE DE MENU (Fichier / Affichage / Exécution / Infos-Aide)
   ============================================================ */
const menuEls = [...document.querySelectorAll('.menu')];

function closeAllMenus(){
  menuEls.forEach((m) => {
    m.classList.remove('open');
    m.querySelector('.menu-trigger').setAttribute('aria-expanded', 'false');
  });
}
menuEls.forEach((menu) => {
  const trigger = menu.querySelector('.menu-trigger');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = menu.classList.contains('open');
    closeAllMenus();
    if(!wasOpen){ menu.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); }
  });
  // Un clic à l'intérieur du panneau ne doit pas se propager jusqu'au
  // gestionnaire global qui referme tous les menus.
  menu.querySelector('.menu-panel').addEventListener('click', (e) => e.stopPropagation());
});
document.addEventListener('click', closeAllMenus);
document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeAllMenus(); });

// Actions simples (un seul effet, pas de sous-choix) : déclarées une fois,
// reliées par data-action.
function handleMenuAction(action){
  switch(action){
    case 'new': resetEditor('Créer un nouvel algorithme ? Le contenu actuel sera perdu.'); break;
    case 'open': fileInputEl.value = ''; fileInputEl.click(); break;
    case 'save': saveAlgoFile(); break;
    case 'print': printCode(); break;
    case 'export-console': exportConsoleLog(); break;
    case 'close': resetEditor('Fermer le programme actuel ? Le contenu non enregistré sera perdu.'); break;
    case 'clear-console': clearConsole(); break;
    default: break;
  }
}
document.querySelectorAll('[data-action]').forEach((btn) => {
  btn.addEventListener('click', () => { handleMenuAction(btn.dataset.action); closeAllMenus(); });
});

/* ---------- Fichier ---------- */
function resetEditor(confirmMessage){
  if(!window.confirm(confirmMessage)) return;
  hideAutocomplete();
  codeEl.value = '';
  onCodeChanged();
  clearConsole();
  setStatus('ready');
  codeEl.focus();
}

fileInputEl.addEventListener('change', () => {
  const file = fileInputEl.files && fileInputEl.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    hideAutocomplete();
    codeEl.value = String(reader.result);
    onCodeChanged();
    clearConsole();
    setStatus('ready');
  };
  reader.onerror = () => appendError(`Impossible de lire le fichier "${file.name}".`);
  reader.readAsText(file, 'utf-8');
});

function downloadTextFile(filename, text, mime){
  const blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
function saveAlgoFile(){ downloadTextFile('algorithme.algo', codeEl.value); }
function exportConsoleLog(){
  const text = consoleEl.innerText || consoleEl.textContent || '';
  downloadTextFile('console.log', text);
}
function printCode(){
  printAreaEl.textContent = codeEl.value;
  window.print();
}

/* ---------- Affichage : taille de police / thème / numéros de lignes ---------- */
fontSizeGroupEl.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const px = Number(btn.dataset.fontsize);
    document.documentElement.style.setProperty('--code-font-size', px + 'px');
    document.documentElement.style.setProperty('--code-line-height', Math.round(px * 1.5) + 'px');
    fontSizeGroupEl.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
    onCodeChanged();
    closeAllMenus();
  });
});

function setTheme(mode){
  document.documentElement.dataset.theme = mode === 'light' ? 'light' : '';
  themeGroupEl.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b.dataset.themeChoice === mode));
  const meta = document.querySelector('meta[name="theme-color"]');
  if(meta) meta.setAttribute('content', mode === 'light' ? '#f5f3ee' : '#0e1120');
}
themeGroupEl.querySelectorAll('button').forEach((btn) => {
  btn.addEventListener('click', () => { setTheme(btn.dataset.themeChoice); closeAllMenus(); });
});

toggleLineNumbersEl.addEventListener('click', () => {
  lineNumbersVisible = !lineNumbersVisible;
  gutterEl.style.display = lineNumbersVisible ? '' : 'none';
  toggleLineNumbersEl.textContent = (lineNumbersVisible ? '☑ ' : '☐ ') + 'Numéros de lignes';
  closeAllMenus();
});

/* ============================================================
   MODALES : Guide de syntaxe / À propos
   ============================================================ */
function openModal(title, bodyHTML){
  modalTitleEl.textContent = title;
  modalBodyEl.innerHTML = bodyHTML;
  modalOverlayEl.hidden = false;
  modalCloseEl.focus();
}
function closeModal(){ modalOverlayEl.hidden = true; }
modalCloseEl.addEventListener('click', closeModal);
modalOverlayEl.addEventListener('click', (e) => { if(e.target === modalOverlayEl) closeModal(); });
document.addEventListener('keydown', (e) => { if(e.key === 'Escape' && !modalOverlayEl.hidden) closeModal(); });

function openSyntaxGuide(){
  openModal('📖 Guide de syntaxe', `
    <h3>Structure générale</h3>
    <p><code>Algorithme Nom</code> … <code>Variables</code> … <code>Début</code> … <code>Fin</code></p>
    <h3>Conditionnelles</h3>
    <p><code>Si cond Alors … SinonSi cond Alors … Sinon … FinSi</code></p>
    <p><code>Selon expr Faire / Cas valeur : / Autrement : / FinSelon</code></p>
    <h3>Boucles</h3>
    <p><code>Pour i De a À b [Pas p] Faire … FinPour</code></p>
    <p><code>TantQue cond Faire … FinTantQue</code></p>
    <p><code>Répéter … Jusqu'à cond</code> (corps exécuté au moins une fois)</p>
    <h3>Entrées / sorties</h3>
    <p><code>Lire(variable)</code> — <code>Ecrire("texte", variable, …)</code></p>
    <h3>Fonctions &amp; Procédures</h3>
    <p><code>Fonction Nom(p1, p2) : Type … Début … Retourner valeur … FinFonction</code></p>
    <p><code>Procédure Nom(p1, p2) … Début … FinProcédure</code> (pas de retour)</p>
    <p>Appel : <code>x &lt;- Nom(a, b)</code> pour une fonction — <code>Appeler Nom(a, b)</code> ou <code>Nom(a, b)</code> seul pour une procédure.</p>
    <h3>Fonctions intégrées</h3>
    <p><code>Ord(car)</code> renvoie le code numérique (ASCII/Unicode) du caractère <code>car</code>. Ex. : <code>Ord("A")</code> vaut 65.</p>
    <h3>Opérateurs</h3>
    <p>Arithmétiques : <code>+ - * / Mod Div</code> — Comparaison : <code>= &lt;&gt; &lt; &gt; &lt;= &gt;=</code> — Logiques : <code>Et Ou Non</code></p>
  `);
}

function openAboutModal(){
  const c = INSTITUTION_CONFIG;
  const email = c.contactEmail || '';
  const emailRow = email
    ? `<dt>Contact</dt><dd><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></dd>`
    : '';
  openModal('ℹ️ À propos', `
    <dl>
      <dt>Nom du logiciel</dt><dd>${escapeHtml(c.appName || 'SOFT-KEY Interpreter')}</dd>
      <dt>Concepteur / Développement</dt><dd>${escapeHtml(c.designer || 'SOFT-KEY')}</dd>
      <dt>Année de création</dt><dd>${escapeHtml(c.foundingYear || '2026')}</dd>
      <dt>Objectif</dt><dd>${escapeHtml(c.objective || '')}</dd>
      ${emailRow}
    </dl>
  `);
}
document.querySelector('[data-action="syntax-guide"]').addEventListener('click', openSyntaxGuide);
document.querySelector('[data-action="about"]').addEventListener('click', openAboutModal);

/* ---------- Raccourcis clavier globaux (Ctrl+S, Ctrl+O) ---------- */
document.addEventListener('keydown', (e) => {
  const mod = e.ctrlKey || e.metaKey;
  if(mod && (e.key === 's' || e.key === 'S')){ e.preventDefault(); saveAlgoFile(); }
  else if(mod && (e.key === 'o' || e.key === 'O')){ e.preventDefault(); fileInputEl.value = ''; fileInputEl.click(); }
});

/* ---------- Initialisation ---------- */
applyInstitutionConfig(INSTITUTION_CONFIG);
buildExampleMenu(INSTITUTION_CONFIG);

const exampleKeys = Object.keys(INSTITUTION_CONFIG.examples || {});
if(exampleKeys.length){
  loadExample(exampleKeys[0]);
} else {
  onCodeChanged();
  setStatus('ready');
}

// JetBrains Mono charge de façon asynchrone : une fois prête, la hauteur de
// ligne et la largeur des caractères peuvent légèrement changer, on
// resynchronise le gutter et la coloration par sécurité.
if(document.fonts && document.fonts.ready){
  document.fonts.ready.then(onCodeChanged).catch(() => {});
}

// Enregistrement du Service Worker : rend l'application installable comme
// une app native (bouton « Installer » du navigateur) et utilisable
// hors-ligne. Ne fonctionne qu'en contexte sécurisé (http://localhost ou
// https://) — les navigateurs désactivent les Service Workers en file://,
// donc rien ne se passe si vous ouvrez simplement index.html en double-clic
// (l'app reste néanmoins pleinement fonctionnelle dans ce cas, juste sans
// installation ni cache hors-ligne).
if('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
