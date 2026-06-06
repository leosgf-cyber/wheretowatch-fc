#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Gera a lista de 95 presentes (HTML + texto) para a lua de mel no Japão.
Faixas de preço seguem o gráfico de referência: 17 / 33 / 18 / 27."""

# (numero, tema, emoji, nome, preco, referencia_iene, keyword_img, descricao)
G = "Gastronomia"; D = "Diversão & Cultura"; L = "Logística"; H = "Hospedagem"

PRESENTES = [
    # ---------------- GASTRONOMIA (24) ----------------
    (G,"🍣","Tour de ramen em Shinjuku",100,"~¥3.000/pessoa","ramen,tokyo","Maratona de tigelas fumegantes pelos becos de Tóquio, guiada por quem sabe onde mora o melhor caldo."),
    (G,"🍣","Takoyaki em Dotonbori",100,"~¥3.000","takoyaki,osaka","Bolinhos de polvo quentinhos comidos em pé, no coração neon de Osaka. Cuidado pra não queimar a língua!"),
    (G,"🍣","Café temático (corujas & gatos)",110,"~¥3.500","cat,cafe,japan","Um café com a maior fofura: bichinhos no colo enquanto vocês tomam um matcha latte."),
    (G,"🍣","Omakase no balcão",120,"~¥3.800/pessoa","omakase,sushi","Sentar no balcão e deixar o itamae decidir cada peça. Vocês só dizem 'arigatô' e abrem a boca."),
    (G,"🍣","Matcha & wagashi em Uji",130,"~¥4.000","matcha,wagashi","Chá verde no berço do matcha, acompanhado de docinhos tradicionais que são quase pequenas obras de arte."),
    (G,"🍣","Okonomiyaki em Osaka",140,"~¥4.300","okonomiyaki","A 'panqueca' salgada feita na chapa bem à sua frente. Pura comfort food japonesa."),
    (G,"🍣","Jantar de tempura no balcão",300,"~¥9.000 casal","tempura","Camarões e legumes em uma tempura leve como nuvem, servidos peça por peça pelo chef."),
    (G,"🍣","Bar hopping no Golden Gai",320,"~¥10.000 casal","golden,gai,tokyo","Pulando entre minúsculos bares de Shinjuku, cada um com 6 banquinhos e mil histórias."),
    (G,"🍣","Aula de culinária: fazer sushi",340,"~¥10.500 casal","sushi,making","Mãos na massa (e no arroz!): aprendam a enrolar o sushi pra repetir em casa e impressionar."),
    (G,"🍣","Shabu-shabu à vontade",360,"~¥11.000 casal","shabu,shabu","Mergulhar fatias finíssimas de carne no caldo quente, a dois, até não caber mais."),
    (G,"🍣","Jantar de Wagyu (yakiniku)",350,"~¥11.000 casal","wagyu,beef","Carne que derrete antes de mastigar, grelhada na brasa bem na frente de vocês."),
    (G,"🍣","Unagi premium (enguia grelhada)",380,"~¥11.500 casal","unagi,eel","Enguia glaceada no molho doce sobre arroz quente — um clássico que vicia."),
    (G,"🍣","Melão & frutas de luxo",400,"~¥12.000","melon,gift,japan","No Japão fruta é joia: um melão perfeito embrulhado como presente de gala."),
    (G,"🍣","Degustação de whisky japonês",420,"~¥13.000 casal","whisky,japan","Um flight de whiskies premiados, daqueles que conquistaram o mundo todo."),
    (G,"🍣","Kaiseki tradicional em Kyoto",520,"~¥16.000 casal","kaiseki,kyoto","O banquete japonês das mil estações: pratinhos delicados que contam a história do ano."),
    (G,"🍣","Teppanyaki com chef",560,"~¥17.000 casal","teppanyaki","Show de facas, fogo e wagyu na chapa, com o chef performando só pra vocês."),
    (G,"🍣","Jantar com vista no Tokyo Skytree",580,"~¥18.000 casal","tokyo,skytree,night","Jantar lá no alto, com a cidade inteira piscando lá embaixo."),
    (G,"🍣","Café da manhã de chef + saquê premium",620,"~¥19.000 casal","sake,tasting","Começar o dia com uma degustação guiada de saquês raros e petiscos do mercado."),
    (G,"🍣","Kaiseki de caranguejo em Hokkaido",650,"~¥20.000 casal","crab,hokkaido","Caranguejo-rei em mil preparos no norte gelado do Japão. Festival de frutos do mar."),
    (G,"🍣","Jantar de fugu (baiacu)",700,"~¥21.000 casal","fugu,japan","O lendário (e perfeitamente seguro!) peixe-baiacu, preparado por chef licenciado. Aventura na mesa."),
    (G,"🍣","Sukiyaki de Wagyu Kobe",900,"~¥27.000 casal","kobe,beef","O ápice da carne japonesa, cozida lentamente no caldo doce-salgado. Indecente de tão bom."),
    (G,"🍣","Tour gastronômico privativo (dia inteiro)",1100,"~¥34.000 casal","japanese,food,market","Um dia inteiro comendo o Japão com guia só pra vocês: mercado, izakaya, doces e segredos."),
    (G,"🍣","Jantar estrelado Michelin",1200,"~¥37.000 casal","fine,dining,japan","Menu-degustação em uma casa estrelada — a refeição pra lembrar pelo resto da vida."),
    (G,"🍣","Omakase de um mestre",1400,"~¥43.000 casal","sushi,chef","Balcão de um itamae renomado, peixe do dia escolhido a dedo. Sushi em estado de arte."),

    # ---------------- DIVERSÃO & CULTURA (32) ----------------
    (D,"🎎","Karaokê a noite toda",120,"~¥3.800 casal","karaoke,tokyo","Cabine só de vocês, microfone na mão e o repertório inteiro até o sol nascer."),
    (D,"🎎","Aula de caligrafia (shodô)",130,"~¥4.000 casal","calligraphy,japan","Pincel, tinta e respiração: escrever o nome um do outro em kanji. Quadro de recordação garantido."),
    (D,"🎎","Bike no bambuzal de Arashiyama",150,"~¥4.500 casal","bamboo,arashiyama","Pedalar entre bambus gigantes que riscam o céu. Cinematográfico do começo ao fim."),
    (D,"🎎","Observatório Shibuya Sky",160,"~¥5.000 casal","shibuya,sky","O famoso cruzamento visto lá de cima, e o pôr do sol mais instagramável de Tóquio."),
    (D,"🎎","Cerimônia do chá em Kyoto",160,"~¥5.000 casal","tea,ceremony,kyoto","Ajoelhar no tatami, bater o matcha e respirar fundo. Um momento de silêncio a dois."),
    (D,"🎎","Piquenique de hanami",200,"~¥6.000 casal","cherry,blossom,picnic","Toalha estendida sob as cerejeiras em flor, bentô na mão. Romance nível primavera japonesa."),
    (D,"🎎","Quimono + passeio em Kyoto",200,"~¥6.000 casal","kimono,kyoto","Vestir-se a caráter e perambular pelas ruelas de Gion como num filme antigo."),
    (D,"🎎","Ingressos teamLab",240,"~¥3.800 cada","teamlab,digital,art","De mãos dadas dentro de um mar de luzes e flores digitais. A próxima foto do casal já era."),
    (D,"🎎","Riquixá em Asakusa",300,"~¥9.000 casal","rickshaw,asakusa","Passeio puxado por um guia atlético pelas ruas do templo Sensō-ji. Charme retrô."),
    (D,"🎎","Festival de fogos com yukata",300,"~¥9.000 casal","fireworks,yukata","Vestir o yukata e assistir aos hanabi explodirem no céu de verão. Inesquecível."),
    (D,"🎎","Aula de samurai / ninja",300,"~¥9.000 casal","samurai,ninja","Empunhar a katana (ou os shurikens) e treinar os movimentos. Diversão pura."),
    (D,"🎎","Ghibli Park / Museu Ghibli",320,"~¥10.000 casal","ghibli,museum","Entrar no mundo de Totoro e companhia. Para o casal que nunca cresceu (no bom sentido)."),
    (D,"🎎","Onsen day em Hakone",320,"~¥10.000 casal","onsen,hakone","Um dia inteiro pulando entre banhos termais com vista pra montanha. Relaxamento total."),
    (D,"🎎","Mario Kart pelas ruas de Tóquio",350,"~¥11.000 casal","go,kart,tokyo","Fantasiados, dirigindo karts de verdade pelo trânsito de Tóquio. Sim, é tão divertido quanto parece."),
    (D,"🎎","Show de taiko (tambores)",350,"~¥11.000 casal","taiko,drums","A batida dos tambores gigantes que vocês sentem no peito. Energia ancestral."),
    (D,"🎎","Cruzeiro ao pôr do sol na baía de Tóquio",360,"~¥11.000 casal","tokyo,bay,cruise","Taça na mão enquanto a cidade acende suas luzes vista do mar."),
    (D,"🎎","Ingressos de sumô (torneio)",380,"~¥11.500 casal","sumo,tournament","Assistir aos gigantes se enfrentarem no dohyō. Tradição milenar ao vivo."),
    (D,"🎎","Nara: cervos & templos",420,"~¥13.000 casal","nara,deer","Alimentar os cervos que fazem reverência (juro!) e visitar o Grande Buda."),
    (D,"🎎","Esqui: day pass em Niseko",460,"~¥14.000 casal","ski,niseko","Descer a neve pó mais famosa da Ásia. Depois, chocolate quente coladinhos."),
    (D,"🎎","Macacos na neve em Nagano",480,"~¥14.500 casal","snow,monkey,nagano","Ver os macacos tomando banho quente na neve. Fofura de nível mundial."),
    (D,"🎎","Snorkel em Okinawa",540,"~¥16.500 casal","okinawa,snorkel","Águas turquesa e corais coloridos no Caribe japonês. Pausa tropical da viagem."),
    (D,"🎎","Tokyo Disneyland — 2 ingressos",580,"~¥9.000 cada","tokyo,disneyland","Um dia de criança grande no parque mais querido do Japão."),
    (D,"🎎","Bate-volta ao Monte Fuji",450,"~¥14.000 casal","mount,fuji,japan","Um dia caçando o melhor ângulo da montanha mais famosa do Japão, com lago e teleférico."),
    (D,"🎎","Tokyo DisneySea — 2 ingressos",640,"~¥10.000 cada","disneysea,tokyo","O parque único no mundo, todo temático do mar. Mágico até pra quem não curte parque."),
    (D,"🎎","Universal Studios Osaka",680,"~¥10.500 cada","universal,studios,osaka","Super Nintendo World, Harry Potter e adrenalina o dia inteiro."),
    (D,"🎎","Passeio de inverno em Hokkaido",720,"~¥22.000 casal","hokkaido,winter","Trenó, neve fresquinha e paisagens de cartão-postal no extremo norte."),
    (D,"🎎","Parapente com vista do Fuji",880,"~¥27.000 casal","paragliding,fuji","Voar lado a lado com o Monte Fuji no horizonte. Frio na barriga e vista de tirar o fôlego."),
    (D,"🎎","Disney — experiência VIP premium",1050,"~¥32.000 casal","disney,vip","Guia exclusivo, fura-filas e os melhores lugares pro show. Dia perfeito sem espera."),
    (D,"🎎","Jantar com gueixas em Gion",1100,"~¥34.000 casal","geisha,gion","Uma noite rara: jantar com apresentação de dança e jogos com gueixas e maikos."),
    (D,"🎎","Esqui: 2 dias em Niseko (aulas + passe)",1250,"~¥38.000 casal","ski,powder,japan","Fim de semana completo na neve pó, com instrutor pra vocês arrasarem nas pistas."),
    (D,"🎎","Mergulho: 2 dias em Okinawa",1300,"~¥40.000 casal","diving,okinawa","Pacote de mergulhos nas ilhas tropicais. Tartarugas e mantas inclusas (com sorte!)."),
    (D,"🎎","Helicóptero sobre Tóquio à noite",1500,"~¥46.000 casal","helicopter,tokyo,night","Sobrevoar o oceano de luzes de Tóquio depois do anoitecer. Pedido de... renovação de votos?"),

    # ---------------- LOGÍSTICA (17) ----------------
    (L,"🚄","Despacho de malas entre cidades",120,"~¥3.800","luggage,japan","O serviço mágico (takkyubin) que manda a mala pro próximo hotel. Vocês viajam de mãos livres."),
    (L,"🚄","Cartão Suica recarregado",150,"~¥4.500","suica,train,card","O cartãozinho que abre todas as catracas e ainda paga o konbini. Praticidade total."),
    (L,"🚄","Teleférico Hakone Ropeway",180,"~¥5.500 casal","ropeway,hakone","Subir a montanha flutuando, com o Fuji aparecendo entre as nuvens (se ele colaborar!)."),
    (L,"🚄","Narita Express ida e volta",300,"~¥9.000 casal","narita,express,train","O trem confortável que liga o aeroporto ao centro. Começo e fim da viagem sem stress."),
    (L,"🚄","Transfer do aeroporto de Narita",320,"~¥10.000","airport,transfer","Carro esperando vocês com as malas cheias de lembrancinhas. Direto pro hotel."),
    (L,"🚄","Pocket WiFi para os 18 dias",350,"~¥11.000","wifi,travel","Internet no bolso a viagem toda: mapas, traduções e fotos no story na hora."),
    (L,"🚄","Locação de carro por um dia",420,"~¥13.000","car,rental,japan","Liberdade pra explorar o interior e a costa no ritmo de vocês."),
    (L,"🚄","Seguro viagem para os 18 dias",600,"~¥18.000 casal","travel,insurance","O presente invisível mais importante: tranquilidade do começo ao fim."),
    (L,"🚄","Guia local particular por um dia",700,"~¥21.000 casal","tour,guide,japan","Alguém que conhece os cantos secretos e conta tudo. Um dia turbinado."),
    (L,"🚄","Shinkansen Tóquio–Kyoto (casal)",900,"~¥27.000 casal","shinkansen,train","O trem-bala a 300 km/h ligando as duas grandes paixões da viagem. Bentô de trem incluso na experiência!"),
    (L,"🚄","Voo Tóquio–Sapporo (casal)",1050,"~¥32.000 casal","airplane,japan","Asas até o norte gelado pra fechar a viagem com neve."),
    (L,"🚄","Voo Tóquio–Okinawa (casal)",1200,"~¥37.000 casal","okinawa,beach,flight","Um pulo até as praias tropicais. Do neon ao paraíso em duas horas."),
    (L,"🚄","Japan Rail Pass 7 dias — passe 1",1600,"~¥50.000/pessoa","shinkansen,station","O passe mágico do trem-bala: o Japão inteiro liberado por uma semana. (Este é o passe de um de vocês.)"),
    (L,"🚄","Japan Rail Pass 7 dias — passe 2",1600,"~¥50.000/pessoa","bullet,train,japan","E este é o passe do outro! Viajar sempre lado a lado, sem deixar ninguém pra trás."),
    (L,"🚄","Japan Rail Pass 14 dias",2500,"~¥80.000/pessoa","train,japan,platform","Duas semanas de trens ilimitados pra quem quer ver tudo sem pressa."),
    (L,"🚄","Japan Rail Pass 21 dias",3200,"~¥100.000/pessoa","japan,railway","Os 18 dias inteiros cobertos! O passaporte definitivo sobre trilhos."),
    (L,"🚄","Voo internacional — trecho de volta",3800,"~¥117.000/pessoa","airplane,sky","O voo que traz vocês de volta pra casa (com a mala mais pesada de lembranças)."),

    # ---------------- HOSPEDAGEM (22) ----------------
    (H,"♨️","Business hotel econômico (1 diária)",320,"~¥10.000 casal","hotel,room,japan","Quartinho compacto e impecável, do jeitinho japonês. Eficiente e aconchegante."),
    (H,"♨️","Diária em hotel em Shibuya",480,"~¥15.000 casal","tokyo,hotel,skyline","Acordar com os arranha-céus e o cruzamento mais movimentado do mundo logo ali embaixo."),
    (H,"♨️","Hotel-templo (shukubo) em Koyasan",520,"~¥16.000 casal","koyasan,temple","Dormir num templo budista, jantar vegetariano dos monges e meditação ao amanhecer."),
    (H,"♨️","Suíte de lua de mel — upgrade",600,"~¥18.000","honeymoon,suite","Aquele upgrade pra suíte com champanhe, pétalas e vista. Porque vocês merecem."),
    (H,"♨️","Glamping ao pé do Monte Fuji",700,"~¥21.000 casal","glamping,fuji","Dormir sob as estrelas com conforto de hotel e o Fuji de cenário ao acordar."),
    (H,"♨️","Cabana romântica em Hokkaido",750,"~¥23.000 casal","cabin,hokkaido,snow","Lareira acesa, neve lá fora e ninguém por perto. Refúgio perfeito a dois."),
    (H,"♨️","Machiya tradicional em Kyoto",850,"~¥26.000 casal","machiya,kyoto","Uma casa de madeira centenária só pra vocês, no coração da Kyoto antiga."),
    (H,"♨️","Apartamento por 2 noites",900,"~¥28.000 casal","apartment,tokyo","Sentir-se morador por uns dias, com cozinha pra um café da manhã preguiçoso."),
    (H,"♨️","Diária em ryokan com onsen",950,"~¥30.000 casal","ryokan,onsen","Futon no tatami, banho termal privativo e jantar kaiseki interminável. O auge do romance japonês."),
    (H,"♨️","Resort à beira-mar em Okinawa",980,"~¥30.000 casal","okinawa,resort","Pés na areia branca, drink na mão e o mar mais azul do Japão."),
    (H,"♨️","Ryokan com kaiseki em Kanazawa",1150,"~¥35.000 casal","kanazawa,ryokan","Hospitalidade refinada na cidade dos jardins e do ouro. Jantar de outro nível."),
    (H,"♨️","Vista do Fuji em Kawaguchiko",1250,"~¥38.000 casal","fuji,lake,kawaguchiko","Quarto premium com o Monte Fuji refletido no lago bem da janela. Bom dia de cinema."),
    (H,"♨️","Ryokan em Hakone com vista do Fuji",1300,"~¥40.000 casal","ryokan,fuji,view","Onsen ao ar livre olhando pra montanha sagrada. Vapor, silêncio e vocês dois."),
    (H,"♨️","Suíte com onsen privativo no quarto",1400,"~¥43.000 casal","private,onsen,room","Banho termal só de vocês, dentro do quarto, a qualquer hora da noite."),
    (H,"♨️","Última noite de luxo em Tóquio",1600,"~¥50.000 casal","luxury,hotel,tokyo","A despedida da viagem em grande estilo, no alto da cidade. Brinde ao 'até a próxima'."),
    (H,"♨️","2 noites em resort em Okinawa",1900,"~¥58.000 casal","okinawa,beach,resort","Um mini-descanso dentro da viagem: duas noites de pé na areia e nada de relógio."),
    (H,"♨️","Pacote Fuji + Hakone (2 noites)",2200,"~¥68.000 casal","hakone,fuji,onsen","Dois dias de onsen, natureza e a montanha sagrada. Recarregada total a dois."),
    (H,"♨️","3 noites em ryokan tradicional",2700,"~¥83.000 casal","ryokan,japan,traditional","Mergulho fundo na tradição: três noites de tatami, kaiseki e banhos termais."),
    (H,"♨️","Park Hyatt Tóquio (1 diária)",2800,"~¥86.000 casal","park,hyatt,tokyo","A vista 'Encontros e Desencontros' lá do alto. Luxo silencioso e inesquecível."),
    (H,"♨️","Hoshinoya — ryokan de luxo",3500,"~¥108.000 casal","hoshinoya,luxury,ryokan","O ryokan dos sonhos: design impecável, serviço impecável, momento impecável."),
    (H,"♨️","Suíte presidencial — 1 noite especial",4000,"~¥123.000 casal","presidential,suite","A noite mais especial da viagem, naquela suíte que dá pra dar uma festa dentro."),
    (H,"♨️","Aman Tokyo (ultra-luxo)",5000,"~¥154.000 casal","aman,tokyo,luxury","O ápice absoluto da hospedagem em Tóquio. Sereníssimo, espetacular, inesquecível."),
]

def faixa(p):
    if p <= 299: return 0
    if p <= 599: return 1
    if p <= 999: return 2
    return 3

FAIXAS = ["De R$ 100 até R$ 299","De R$ 300 até R$ 599","De R$ 600 até R$ 999","Superior a R$ 1.000"]
ALVO = [17,33,18,27]

# --- conferência das contagens ---
cont = [0,0,0,0]
for item in PRESENTES:
    cont[faixa(item[3])] += 1
assert len(PRESENTES) == 95, f"Total = {len(PRESENTES)}"
assert cont == ALVO, f"Faixas = {cont}, alvo = {ALVO}"

# ================= HTML =================
def card(n, t, emoji, nome, preco, ref, kw, desc):
    # tags: usa no máximo 2 para não zerar resultados; lock fixa a foto (definitiva)
    tags = ",".join(kw.split(",")[:2])
    img = f"https://loremflickr.com/600/450/{tags}?lock={n}"
    preco_fmt = f"{preco:,}".replace(",", ".")
    return f'''      <div class="card" data-tema="{t}" data-faixa="{faixa(preco)}">
        <div class="thumb"><span class="theme">{emoji} {t}</span><span class="num">{n:02d}</span><img loading="lazy" src="{img}" alt="{nome}"></div>
        <div class="body">
          <h3>{nome}</h3>
          <p>{desc}</p>
          <div class="price">R$ {preco_fmt}</div>
          <div class="ref">{ref}</div>
        </div>
      </div>'''

ordem = [G, D, L, H]
secoes = ""
n = 0
nums = {}
# numeração contínua por tema
for tema in ordem:
    itens = [p for p in PRESENTES if p[0] == tema]
    secoes += f'\n    <h2 class="sec">{itens[0][1]} {tema} <span>({len(itens)})</span></h2>\n    <div class="grid">\n'
    for it in itens:
        n += 1
        nums[(it[0], it[2])] = n
        secoes += card(n, *it) + "\n"
    secoes += "    </div>\n"

html = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lua de Mel no Japão — 95 Presentes</title>
<style>
  :root{{--bg:#f3eae8;--ink:#2b2b2b;--muted:#8a8079;--card:#fff;--grad-top:#7fb8e6;--grad-bot:#7fd0c4}}
  *{{box-sizing:border-box}}
  body{{margin:0;background:var(--bg);color:var(--ink);font-family:"Georgia","Times New Roman",serif}}
  .wrap{{max-width:1180px;margin:0 auto;padding:32px 20px 80px}}
  header h1{{font-size:34px;margin:0 0 6px}}
  header .sub{{color:var(--muted);font-size:17px;margin:0;font-family:Helvetica,Arial,sans-serif}}
  header .sub b{{color:var(--ink)}}
  header .count{{font-size:28px;font-weight:bold;margin:12px 0 0}}
  .bars{{display:flex;gap:14px;align-items:flex-end;height:150px;margin:26px 0 6px}}
  .bar{{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;font-family:Helvetica,Arial,sans-serif}}
  .bar .col{{width:78%;border-radius:12px 12px 6px 6px;background:linear-gradient(180deg,var(--grad-top),var(--grad-bot))}}
  .bar .v{{font-size:18px;font-weight:700}}
  .bar small{{color:var(--muted);font-size:11.5px;text-align:center;line-height:1.3}}
  .legend{{display:flex;flex-wrap:wrap;gap:9px;margin:10px 0 4px;font-family:Helvetica,Arial,sans-serif;font-size:13px}}
  .tag{{padding:5px 12px;border-radius:999px;background:#fff;color:var(--muted);border:1px solid #e4d8d4}}
  h2.sec{{font-size:24px;margin:38px 0 4px;border-bottom:2px solid #e4d8d4;padding-bottom:8px}}
  h2.sec span{{color:var(--muted);font-size:16px;font-weight:normal}}
  .grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(248px,1fr));gap:22px;margin-top:18px}}
  .card{{background:var(--card);border-radius:18px;overflow:hidden;box-shadow:0 6px 18px rgba(120,90,80,.10);display:flex;flex-direction:column;transition:transform .15s,box-shadow .15s}}
  .card:hover{{transform:translateY(-4px);box-shadow:0 12px 26px rgba(120,90,80,.16)}}
  .thumb{{position:relative;aspect-ratio:4/3;background:linear-gradient(180deg,var(--grad-top),var(--grad-bot))}}
  .thumb img{{width:100%;height:100%;object-fit:cover;display:block}}
  .theme{{position:absolute;top:10px;left:10px;font-family:Helvetica,Arial,sans-serif;font-size:10.5px;font-weight:700;letter-spacing:.4px;text-transform:uppercase;background:rgba(255,255,255,.92);color:#4a4a4a;padding:4px 9px;border-radius:999px}}
  .num{{position:absolute;top:10px;right:10px;font-family:Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;background:rgba(43,43,43,.62);color:#fff;padding:3px 8px;border-radius:999px}}
  .body{{padding:15px 16px 18px;display:flex;flex-direction:column;gap:7px;flex:1}}
  .body h3{{margin:0;font-size:17.5px;line-height:1.25}}
  .body p{{margin:0;color:var(--muted);font-size:13px;line-height:1.5;font-family:Helvetica,Arial,sans-serif;flex:1}}
  .price{{font-family:Helvetica,Arial,sans-serif;font-weight:800;font-size:20px;color:#2f8f86;margin-top:6px}}
  .ref{{font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#b3a79f}}
  footer{{margin-top:46px;color:var(--muted);font-size:13px;font-family:Helvetica,Arial,sans-serif;text-align:center;line-height:1.7}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Lista feita para vocês 🇯🇵💍</h1>
    <p class="sub">Com base em <b>18 dias</b> de lua de mel no Japão, recomendamos</p>
    <p class="count">95 presentes</p>
    <div class="bars">
      {''.join(f'<div class="bar"><span class="v">{cont[i]}</span><div class="col" style="height:{30+cont[i]*3}px"></div><small>{FAIXAS[i]}</small></div>' for i in range(4))}
    </div>
    <div class="legend">
      <span class="tag">🍣 Gastronomia (24)</span>
      <span class="tag">🎎 Diversão & Cultura (32)</span>
      <span class="tag">🚄 Logística (17)</span>
      <span class="tag">♨️ Hospedagem (22)</span>
      <span class="tag">💱 1 iene ≈ R$ 0,032 (jun/2026)</span>
    </div>
  </header>
{secoes}
  <footer>
    95 presentes · Valores em reais convertidos do iene (~R$ 0,032/¥, jun/2026), arredondados e baseados em
    referências do Numbeo e de portais de viagem.<br>
    Imagens ilustrativas (placeholders por palavra-chave) — a trocar pelas definitivas na versão final.
  </footer>
</div>
</body>
</html>'''

with open("lua-de-mel-japao/presentes.html", "w", encoding="utf-8") as f:
    f.write(html)

# ================= TEXTO =================
linhas = []
linhas.append("LISTA DE PRESENTES — LUA DE MEL NO JAPÃO (18 dias) 🇯🇵💍")
linhas.append("95 sugestões · valores em R$ (1 iene ≈ R$ 0,032, jun/2026 · base Numbeo + portais de viagem)")
linhas.append("Faixas (igual ao gráfico de referência): R$100–299 = 17 | R$300–599 = 33 | R$600–999 = 18 | >R$1.000 = 27")
linhas.append("=" * 78)
n = 0
for tema in ordem:
    itens = [p for p in PRESENTES if p[0] == tema]
    linhas.append("")
    linhas.append(f"{itens[0][1]}  {tema.upper()}  ({len(itens)})")
    linhas.append("-" * 78)
    for it in itens:
        n += 1
        t, emoji, nome, preco, ref, kw, desc = it
        preco_fmt = f"R$ {preco:,}".replace(",", ".")
        linhas.append(f"{n:>2}. {nome}  —  {preco_fmt}   ({ref})")
        linhas.append(f"    {desc}")
linhas.append("")
linhas.append("=" * 78)
linhas.append("Conferência de faixas: " + " | ".join(f"{FAIXAS[i]}: {cont[i]}" for i in range(4)) + f"  | TOTAL: {len(PRESENTES)}")

with open("lua-de-mel-japao/presentes-lista.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(linhas) + "\n")

print("OK — gerados presentes.html e presentes-lista.txt")
print("Faixas:", dict(zip(FAIXAS, cont)), "Total:", len(PRESENTES))
