# TwójMentor.IT - Landing Page (repozytorium LP)

Statyczna strona marketingowa platformy TwójMentor.IT (mentorzy IT i uczniowie). Produkcja: https://twojmentor.it

Ten plik jest dokumentacją dla ludzi i agentów AI. Przeczytaj sekcję 1 przed jakąkolwiek zmianą, a sekcję 10 (dziennik zmian) uzupełnij po każdej zmianie.

## 1. Zasady obowiązkowe

1. **Dokumentacja (WHO / WHY / WHAT).** Każda zmiana w repozytorium wymaga wpisu w sekcji 10 (dziennik zmian) w tym samym commicie. Jeśli zmieniły się zasady, struktura lub proces, zaktualizuj też odpowiednie sekcje tego pliku. Zmiana bez wpisu jest niekompletna.
2. **Zero trailing slashy.** Podstrony to płaskie pliki `nazwa.html`, adres to `/nazwa`. Nie twórz katalogów z `index.html` (poza plikiem głównym `index.html`). Szczegóły: sekcja 4.
3. **Linki wewnętrzne** są zawsze root-absolute i bez slasha końcowego: `/faq`, `/assets/img/logo.webp`. Wyjątek: strona główna `/`. Nie używaj ścieżek względnych (`../`).
4. **Tylko proste znaki ASCII w interpunkcji** (sekcja 6). Zakazane są m.in. długie myślniki i typograficzne cudzysłowy, które zdradzają tekst wygenerowany przez AI.
5. **Canonical** każdej strony to `https://twojmentor.it/<slug>` (bez slasha, bez `www`, nigdy adres z domeny GitHub).
6. **Tag Google (GA4) `G-GP38ZVC1XN`** musi być w `<head>` każdej strony, łącznie z `404.html` (sekcja 7).
7. **Nowa podstrona** = wykonaj checklistę z sekcji 5.
8. **Przed pushem** uruchom `node scripts/check.js`. Musi zwrócić `OK`.
9. **Push do `main` oznacza wdrożenie na produkcję** (sekcja 3). Pushuj wyłącznie na wyraźne polecenie właściciela repozytorium.
10. **Dokumenty prawne** (regulamin, polityka prywatności) zmieniaj tylko na wyraźne polecenie i według treści źródłowej dostarczonej przez właściciela. Nie poprawiaj ich z własnej inicjatywy; niespójności zgłaszaj (sekcja 9).
11. **Całe repozytorium jest publiczne.** GitHub Pages serwuje każdy plik z katalogu głównego (także ten README). Nie wpisuj sekretów, kluczy ani wewnętrznych linków (np. do dokumentów Google).
12. **Nie dodawaj** bibliotek, bundlerów, frameworków ani kroku budowania bez zgody właściciela. To celowo czysty HTML, CSS i JS.

## 2. Opis repozytorium

Serwis jest w fazie przedpremierowej: głównym celem strony jest zapis na listę oczekujących (formularz MailerLite w oknie modalnym) oraz przedstawienie oferty dla uczniów i mentorów. Aplikacja właściwa działa pod osobnym adresem (app.itmentor.it, wg regulaminu) i nie jest częścią tego repozytorium.

Technologia: statyczny HTML, jeden plik CSS, jeden plik JS (vanilla, bez zależności). Język serwisu: polski (`lang="pl"`).

```
/
  index.html                    strona główna (/)
  zostan-mentorem.html          oferta dla mentorów (/zostan-mentorem)
  faq.html                      pytania i odpowiedzi (/faq)
  regulamin.html                regulamin serwisu (/regulamin)
  polityka-prywatnosci.html     polityka prywatności (/polityka-prywatnosci)
  mapa-strony.html              mapa strony w HTML (/mapa-strony)
  404.html                      strona błędu + przekierowanie /x/ na /x
  robots.txt                    zasady dla robotów (SEO i AI)
  sitemap.xml                   mapa strony XML
  llms.txt                      opis serwisu dla modeli językowych (AI)
  CNAME                         domena własna (twojmentor.it), NIE usuwaj
  .nojekyll                     wyłącza Jekyll na GitHub Pages, NIE usuwaj
  assets/css/style.css          wspólne style
  assets/js/main.js             menu mobilne, animacje reveal, slider mentorów, modal zapisu, akordeon FAQ
  assets/img/                   grafiki (webp/png/svg), og-image.jpg
  scripts/serve.js              lokalny podgląd emulujący routing GitHub Pages
  scripts/check.js              walidator zasad z tego pliku
  README.md, CLAUDE.md, AGENTS.md   dokumentacja i wskazówki dla agentów
```

Elementy wspólne (nagłówek, stopka, modal zapisu MailerLite) są skopiowane do każdej strony HTML. Zmiana w jednym z nich wymaga zmiany we wszystkich stronach (`index.html`, `zostan-mentorem.html`, `faq.html`, `regulamin.html`, `polityka-prywatnosci.html`, `mapa-strony.html`, `404.html`).

`404.html` ma pełny układ LP (nagłówek, stopka, modal, styl hero z gradientem i przyciski z `style.css`), a dodatkowo: skrypt przekierowujący `/x/` na `/x` na samym początku `<head>`, `<meta name="robots" content="noindex">` i brak canonical. Strona jest serwowana pod dowolnym nieistniejącym adresem, dlatego używa wyłącznie linków root-absolute.

## 3. Deployment na produkcję

- Hosting: **GitHub Pages** z domeny własnej `twojmentor.it` (plik `CNAME`). Repozytorium: `git@github.com:TwojMentorIT/LP.git`, gałąź `main`.
- Brak kroku budowania i brak workflow GitHub Actions: publikowana jest zawartość katalogu głównego gałęzi `main` (tryb "Deploy from a branch"). Zweryfikuj ustawienia w GitHub: Settings > Pages, gdyby coś się zmieniło.
- **`git push origin main` = wdrożenie na produkcję** (zwykle w 1-2 minuty). Nie ma środowiska stagingowego.
- Proces zmiany:
  1. edytuj pliki,
  2. `node scripts/serve.js` i sprawdź w przeglądarce http://localhost:8080 (routing jak na GitHub Pages: `/faq` działa, `/faq/` daje 404 i przekierowanie),
  3. `node scripts/check.js` musi zwrócić `OK`,
  4. uzupełnij dziennik zmian (sekcja 10),
  5. commit (komunikat opisowy) i push do `main`,
  6. zweryfikuj produkcję: `curl -sI https://twojmentor.it/faq` powinno dać `200`, a `https://twojmentor.it/robots.txt` i `sitemap.xml` mają się otwierać.
- Wycofanie zmiany: `git revert <commit>` i push (nie używaj `push --force` na `main`).
- Wymagany Node.js (dowolna nowsza wersja) tylko do skryptów pomocniczych; sama strona nie potrzebuje niczego poza przeglądarką.

## 4. Adresy URL i trailing slashe

Adresy podstron nie mają slasha na końcu (`/faq`, nie `/faq/`).

Dlaczego pliki płaskie: GitHub Pages dla katalogu `faq/index.html` wymusza przekierowanie `301 /faq -> /faq/`, więc dopóki podstrona jest katalogiem, adres bez slasha nie istnieje. Plik `faq.html` jest serwowany pod `/faq` bez rozszerzenia i bez przekierowania.

Przekierowanie starych adresów `/x/` na `/x`: robi to `404.html` (skrypt na początku `<head>`, zachowuje query string i hash). Ograniczenie: GitHub Pages zwraca dla `/x/` kod HTTP 404, a przekierowanie następuje w przeglądarce (nie jest to prawdziwy `301`). Prawdziwe `301` wymagałoby reguły na serwerze pośredniczącym (np. Cloudflare Redirect Rules przed GitHub Pages), której obecnie nie ma.

Reguły:
- nowa podstrona = plik `nazwa.html` w katalogu głównym, nigdy `nazwa/index.html`,
- linki, canonical, sitemap i `llms.txt` używają adresów bez slasha (poza `/`),
- skrypt `scripts/check.js` zgłasza błąd, jeśli w katalogu głównym pojawi się folder z `index.html`.

## 5. Checklista: nowa podstrona

1. Skopiuj istniejącą stronę o podobnym układzie (np. `regulamin.html` dla treści tekstowych) jako `nowa-strona.html` w katalogu głównym.
2. Ustaw `<title>` (unikalny, do ok. 60 znaków), `meta description` (do ok. 160 znaków), canonical `https://twojmentor.it/nowa-strona` i dokładnie jeden `<h1>`.
3. Zachowaj tag Google i linki root-absolute.
4. Dodaj wpis w `sitemap.xml` (z `lastmod`), w `mapa-strony.html` oraz w `llms.txt`.
5. Dodaj link w nawigacji lub stopce wszystkich stron, jeśli strona ma być odkrywalna.
6. `node scripts/check.js`, następnie dziennik zmian (sekcja 10).

## 6. Pisanie treści (SEO i "zero markerów AI")

Proste znaki ASCII w interpunkcji. Zamiast:

| Zakazane | Zamiast tego |
| --- | --- |
| długi myślnik (U+2014) i półpauza (U+2013) | `-` |
| cudzysłowy typograficzne (U+201E, U+201C, U+201D, U+2018, U+2019) | `"` oraz `'` |
| znak wielokropka (U+2026) | `...` |
| strzałki (np. U+2192), punktory typograficzne, znaczniki wyboru | `->`, `-` lub zwykły tekst |
| emoji w treści | brak (użyj grafiki SVG) |

Dozwolone: polskie litery (ąćęłńóśźż), znak paragrafu `§` w dokumentach prawnych, encja `&times;` (przycisk zamknięcia modala) oraz dwa istniejące dekoracyjne glify UI: `★` (ocena mentora) i emoji prezentu przy "Pierwsza sesja darmowa". Nie dodawaj nowych. Encje typu `&mdash;`, `&hellip;`, `&ldquo;` są również zakazane.

Tekst wklejany z Google Docs, edytorów lub od modeli AI trzeba znormalizować do ASCII przed wklejeniem. `scripts/check.js` zgłasza każdy zakazany znak w plikach `html`, `css`, `js`, `txt`, `xml` i `md`.

Zasady SEO:
- jedna strona = jeden temat, jeden `<h1>`, logiczna hierarchia `h2`/`h3`,
- unikalny `<title>` i `meta description` (bez upychania słów kluczowych), naturalny język polski,
- canonical na `https://twojmentor.it/...`, dane Open Graph i Twitter na stronie głównej (`og:image` = `/assets/img/og-image.jpg`),
- każdy obraz z sensownym `alt` (opis treści, nie słowa kluczowe), wymiary `width`/`height`,
- dane strukturalne JSON-LD (Organization, FAQPage) na stronie głównej; muszą być poprawnym JSON (walidator to sprawdza) i zgodne z widoczną treścią,
- linkowanie wewnętrzne przez opisowe teksty linków,
- każda nowa podstrona trafia do `sitemap.xml`, `mapa-strony.html` i `llms.txt`,
- `robots.txt` zezwala wyszukiwarkom i jawnie wymienionym crawlerom AI (m.in. GPTBot, ClaudeBot, PerplexityBot, Google-Extended); pliki wewnętrzne (README, skrypty) są z niego wyłączone. Zmiana polityki wobec AI to decyzja właściciela.

## 7. Analityka (Google Analytics 4)

Tag `gtag.js` z identyfikatorem `G-GP38ZVC1XN` jest wklejony w `<head>` każdej strony, zaraz po `<meta name="viewport">`. Fragment ma być dokładnie taki, jak podał właściciel (z komentarzem `Google tag (gtag.js)`). Nowa strona musi go zawierać (walidator to sprawdza). Uwaga prawna: sekcja 9.

## 8. Pliki dla wyszukiwarek i AI

- `robots.txt` - reguły indeksowania i wskazanie `Sitemap: https://twojmentor.it/sitemap.xml`.
- `sitemap.xml` - wszystkie indeksowalne podstrony (bez `404.html`), adresy bez slasha, `lastmod` aktualizuj przy zmianie strony.
- `mapa-strony.html` - mapa w HTML dla ludzi i robotów, linkowana ze stopki każdej strony.
- `llms.txt` - zwięzły opis serwisu i lista podstron w formacie Markdown dla modeli językowych. Nie dopisuj tam twierdzeń, których nie ma w regulaminie. Świadomie nie ma `llms-full.txt`, żeby nie duplikować treści (ryzyko rozjazdu z regulaminem).

## 9. Otwarte kwestie (do decyzji właściciela)

1. **Google Analytics a polityka prywatności.** Polityka (sekcja Cookies) mówi, że serwis nie używa opcjonalnych cookies analitycznych wymagających zgody. Tag GA4 jest z tym sprzeczny i zwykle wymaga zgody użytkownika (banner cookies / Consent Mode). Wymaga aktualizacji polityki albo wdrożenia mechanizmu zgody.
2. **Płatności.** Regulamin (§3) stwierdza, że serwis nie obsługuje płatności, natomiast FAQ, dane strukturalne FAQPage na stronie głównej i sekcja "Bezpieczny system płatności" na `/zostan-mentorem` opisują płatności w ramach platformy. Treści są niespójne.
3. `/x/` zwraca HTTP 404 z przekierowaniem po stronie przeglądarki, nie prawdziwe `301` (sekcja 4).
4. Dekoracyjne glify `★` i emoji prezentu (sekcja 6) można w przyszłości zastąpić grafiką SVG.

## 10. Dziennik zmian (WHO / WHY / WHAT)

Zasada: **każda** zmiana w repozytorium dodaje wpis na górze tej listy, w tym samym commicie. Najnowsze wpisy na górze. Format wpisu:

- **Data** (RRRR-MM-DD)
  - **WHO:** kto wykonał zmianę (osoba lub agent + kto zlecił),
  - **WHY:** po co (cel biznesowy lub techniczny, problem, zlecenie),
  - **WHAT:** co dokładnie zmieniono (pliki, zachowanie, skutki, sposób weryfikacji).

Wpisy:

- **2026-09-20 (strona 404)**
  - **WHO:** Claude Code (Claude Sonnet 5) na polecenie Bartka.
  - **WHY:** dotychczasowa `404.html` była minimalna i nie wyglądała jak reszta serwisu.
  - **WHAT:** `404.html` przebudowana na pełny układ LP (nagłówek, stopka, modal zapisu, sekcja z dużym "404" w gradiencie marki, przyciski "Wróć na stronę główną" i "Zobacz mapę strony", linki do głównych podstron). Zachowano przekierowanie `/x/` na `/x`, `noindex` i tag GA. Weryfikacja: `node scripts/check.js` (OK), podgląd lokalny na desktopie i mobile (bez poziomego przewijania).
- **2026-09-20**
  - **WHO:** Claude Code (Claude Sonnet 5) na polecenie Bartka.
  - **WHY:** wdrożenie analityki, uporządkowanie adresów URL (bez trailing slashy), poprawa SEO/AI, usunięcie markerów AI z treści oraz udokumentowanie repozytorium dla kolejnych agentów.
  - **WHAT:** dodano tag GA4 `G-GP38ZVC1XN` na wszystkich stronach; podstrony zamieniono z `nazwa/index.html` na `nazwa.html` (adresy `/faq`, `/regulamin`, `/polityka-prywatnosci`, `/zostan-mentorem`); linki wewnętrzne zamieniono na root-absolute; dodano `404.html` przekierowujący `/x/` na `/x`; canonical, `og:*` i JSON-LD przeniesiono z domeny GitHub na `https://twojmentor.it`; przepisano `robots.txt` i `sitemap.xml`; dodano `llms.txt`, `mapa-strony.html` (link w stopce) oraz `scripts/serve.js` i `scripts/check.js`; z treści usunięto długie myślniki, półpauzy, cudzysłowy typograficzne i znak wielokropka (regulamin i polityka tylko typograficznie, bez zmiany sensu); dodano `README.md`, `CLAUDE.md`, `AGENTS.md`. Weryfikacja: `node scripts/check.js` (OK) i podgląd lokalny (`/faq` 200, `/faq/` przekierowuje na `/faq`, brak błędów zasobów).
- **2026-09-17**
  - **WHO:** Claude Code (Claude Sonnet 5) na polecenie Bartka.
  - **WHY:** aktualizacja dokumentów prawnych zgodnie z nowymi wersjami od zespołu (usunięcie Promocji Profilu i płatności Stripe, nowa struktura polityki), zmiana adresu repozytorium na `TwojMentorIT/LP`.
  - **WHAT:** `regulamin` zastąpiony wersją z 17.09.2026 (§1-§15); `polityka-prywatnosci` zastąpiona wersją "Igor v2" (§1-§10, m.in. Cloudflare jako podmiot przetwarzający, krótsze okresy przechowywania); usunięto nieaktualne odwołania do Promocji; ustawiono `origin` na `git@github.com:TwojMentorIT/LP.git`.
- **2026-09-11**
  - **WHO:** Claude Code (Claude Sonnet 5) na polecenie Bartka.
  - **WHY:** usunięcie z polityki prywatności dostawców, z których serwis nie korzysta.
  - **WHAT:** z tabeli odbiorców danych usunięto wiersze Stripe i hostingu PostgreSQL.
