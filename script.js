// HTML의 각 요소를 자바스크립트에서 사용할 수 있도록 변수에 저장
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const resultArea = document.getElementById("result-area");
const recentSearchList = document.getElementById("recent-search-list");
const copyButton = document.getElementById("copy-button");
const copyMessage = document.getElementById("copy-message");
const bookSelect = document.getElementById("book-select");
const chapterSelect = document.getElementById("chapter-select");
const verseSelect = document.getElementById("verse-select");
const selectSearchButton = document.getElementById("select-search-button");

// ===== Bible API 설정 (api.midvash.com) =====
// 키/회원가입 없이 바로 쓸 수 있는 공개 API. 한국어 번역본 id는 "kor"(개역한글판)
const BIBLE_VERSION = "kor";

// 사용자가 입력하는 한글 책 이름을 API가 요구하는 영어 책 슬러그로 바꾸기 위한 매핑표
// (예: 요한복음 -> "john")
const BOOK_NAME_TO_SLUG = {
  창세기: "genesis", 출애굽기: "exodus", 레위기: "leviticus", 민수기: "numbers", 신명기: "deuteronomy",
  여호수아: "joshua", 사사기: "judges", 룻기: "ruth", 사무엘상: "1samuel", 사무엘하: "2samuel",
  열왕기상: "1kings", 열왕기하: "2kings", 역대상: "1chronicles", 역대하: "2chronicles", 에스라: "ezra",
  느헤미야: "nehemiah", 에스더: "esther", 욥기: "job", 시편: "psalms", 잠언: "proverbs",
  전도서: "ecclesiastes", 아가: "songofsolomon", 이사야: "isaiah", 예레미야: "jeremiah", 예레미야애가: "lamentations",
  에스겔: "ezekiel", 다니엘: "daniel", 호세아: "hosea", 요엘: "joel", 아모스: "amos",
  오바댜: "obadiah", 요나: "jonah", 미가: "micah", 나훔: "nahum", 하박국: "habakkuk",
  스바냐: "zephaniah", 학개: "haggai", 스가랴: "zechariah", 말라기: "malachi",
  마태복음: "matthew", 마가복음: "mark", 누가복음: "luke", 요한복음: "john", 사도행전: "acts",
  로마서: "romans", 고린도전서: "1corinthians", 고린도후서: "2corinthians", 갈라디아서: "galatians", 에베소서: "ephesians",
  빌립보서: "philippians", 골로새서: "colossians", 데살로니가전서: "1thessalonians", 데살로니가후서: "2thessalonians",
  디모데전서: "1timothy", 디모데후서: "2timothy", 디도서: "titus", 빌레몬서: "philemon", 히브리서: "hebrews",
  야고보서: "james", 베드로전서: "1peter", 베드로후서: "2peter", 요한일서: "1john", 요한이서: "2john",
  요한삼서: "3john", 유다서: "jude", 요한계시록: "revelation",
};

// 사용자가 입력한 "요한복음 3:16" 같은 문자열을
// { bookName: "요한복음", bookSlug: "john", chapter: "3", verse: "16" } 형태로 분해하는 함수
// 형식이 맞지 않거나 책 이름을 못 찾으면 null을 반환한다
function parseReference(input) {
  const trimmed = input.trim();
  const lastSpaceIndex = trimmed.lastIndexOf(" ");
  if (lastSpaceIndex === -1) return null;

  const bookName = trimmed.slice(0, lastSpaceIndex).trim();
  const chapterVerse = trimmed.slice(lastSpaceIndex + 1).trim();
  const [chapter, verse] = chapterVerse.split(":");

  const bookSlug = BOOK_NAME_TO_SLUG[bookName];
  if (!bookSlug || !chapter || !verse) return null;

  return { bookName, bookSlug, chapter, verse };
}

// 복사 버튼을 누를 때 쓸, 가장 최근에 검색해서 화면에 표시된 구절 정보
// (아직 검색한 적이 없으면 null)
let lastVerse = null;

// ===== 최근 검색 기록 (배열 + LocalStorage로 관리) =====
const MAX_RECENT_SEARCHES = 10;
const STORAGE_KEY = "bibleSearchHistory";

// LocalStorage에는 문자열만 저장할 수 있으므로, 저장된 JSON 문자열을
// JSON.parse()로 다시 배열로 되돌려서 불러온다. 저장된 값이 없으면 빈 배열을 쓴다
function loadRecentSearches() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
}

// 배열을 JSON.stringify()로 문자열로 바꿔서 LocalStorage에 저장한다
function saveRecentSearches() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
}

// 배열의 맨 앞(인덱스 0)이 가장 최근 검색어가 되도록 관리한다
// 페이지가 열릴 때 LocalStorage에 저장돼 있던 기록을 불러와서 시작한다
let recentSearches = loadRecentSearches();

// 검색어를 최근 검색 배열에 추가(또는 맨 앞으로 이동)하는 함수
function addToRecentSearches(keyword) {
  // 이미 같은 검색어가 있으면 배열에서 먼저 제거한다 (중복 추가 방지)
  const existingIndex = recentSearches.indexOf(keyword);
  if (existingIndex !== -1) {
    recentSearches.splice(existingIndex, 1);
  }

  // 맨 앞에 추가해서 항상 가장 최근 검색어가 목록 맨 위에 오도록 한다
  recentSearches.unshift(keyword);

  // 10개를 넘으면 가장 오래된(배열 맨 뒤) 검색어부터 잘라낸다
  if (recentSearches.length > MAX_RECENT_SEARCHES) {
    recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
  }

  saveRecentSearches();
  renderRecentSearches();
}

// recentSearches 배열 내용을 화면의 <ul id="recent-search-list">에 그려주는 함수
function renderRecentSearches() {
  // 매번 목록을 통째로 비우고 다시 그린다 (배열 순서 그대로 반영하기 위해)
  recentSearchList.innerHTML = "";

  recentSearches.forEach((keyword) => {
    const li = document.createElement("li");
    li.textContent = keyword;

    // 최근 검색 항목을 클릭하면 입력창에 채워 넣고 다시 검색한다
    li.addEventListener("click", () => {
      searchInput.value = keyword;
      performSearch();
    });

    recentSearchList.appendChild(li);
  });
}

// 검색 버튼 클릭과 최근 검색 항목 클릭이 똑같은 검색 로직을 공유할 수 있도록
// 함수로 분리해두었다
function performSearch() {
  // 1. 입력값을 가져온다
  const keyword = searchInput.value;

  // 2. 입력값이 비어 있는지 확인한다 (trim()으로 공백만 입력한 경우도 걸러낸다)
  if (keyword.trim() === "") {
    // 3. 입력값이 비어 있으면 오류 메시지를 표시한다
    errorMessage.textContent = "검색어를 입력해주세요.";
    return;
  }

  // 입력값이 있으므로 이전 오류 메시지는 지운다
  errorMessage.textContent = "";

  // "요한복음 3:16" 형태를 API가 이해하는 책 슬러그/장/절 형태로 변환한다
  const reference = parseReference(keyword);
  if (!reference) {
    errorMessage.textContent = "입력 형식을 확인해주세요. 예: 요한복음 3:16";
    return;
  }

  const { bookName, bookSlug, chapter, verse } = reference;

  // 형식이 올바른 검색어이므로 최근 검색 목록에 추가한다
  addToRecentSearches(keyword.trim());

  // 요청을 시작하기 전, 이전 결과는 지우고 로딩 메시지를 띄운다
  resultArea.textContent = "";
  copyMessage.textContent = "";
  loadingMessage.textContent = "🔄 성경 구절을 검색하고 있습니다...";

  // 검색 중에는 버튼을 비활성화해서 중복 클릭(중복 요청)을 막는다
  searchButton.disabled = true;

  // fetch()란?
  // 자바스크립트에서 서버에 API 요청을 보내고 응답을 받아오는 함수다.
  // fetch(요청할 URL)을 호출하면 네트워크 요청이 시작되고,
  // 응답이 도착하면 그 결과를 담은 Promise(나중에 결과가 채워지는 상자)를 돌려준다.
  // .then()을 이어붙이면 "응답이 오면 이 작업을 해줘"라고 순서대로 지정할 수 있다.
  // 이 API는 키가 필요 없어서 URL만으로 요청이 가능하다
  fetch(`https://api.midvash.com/v1/${BIBLE_VERSION}/${bookSlug}/${chapter}/${verse}`)
    .then((response) => {
      // response.ok는 상태 코드가 200번대 정상 응답일 때만 true다
      // 존재하지 않는 구절(예: 99장 99절)을 요청하면 400 에러가 오므로 여기서 걸러낸다
      if (!response.ok) {
        throw new Error("구절을 찾을 수 없습니다.");
      }
      // 1차 응답은 아직 JSON으로 변환되기 전이므로, .json()으로 실제 데이터를 꺼낸다
      // (이 과정도 시간이 걸리는 작업이라 또 다른 Promise를 반환한다)
      return response.json();
    })
    .then((result) => {
      // 구절 텍스트를 결과 영역에 표시한다
      resultArea.textContent = result.data.text;

      // "본문 복사" 버튼이 쓸 수 있도록 방금 검색된 구절 정보를 기억해둔다
      lastVerse = { bookName, chapter, verse, text: result.data.text };
    })
    // 존재하지 않는 구절이거나 네트워크 오류일 때 이 자리에서 한 번에 처리된다
    .catch((error) => {
      errorMessage.textContent = "검색 중 오류가 발생했습니다. 입력한 구절을 확인해주세요.";
      console.log(error);
    })
    // finally()란?
    // .then()은 성공(resolve)했을 때만, .catch()는 실패(reject)했을 때만 실행된다.
    // 하지만 "로딩 메시지 숨기기"나 "버튼 다시 활성화하기"처럼
    // 성공하든 실패하든 반드시 실행되어야 하는 마무리 작업은 두 곳에 똑같이 써야 하는 문제가 생긴다.
    // finally()는 성공/실패 여부와 상관없이 마지막에 한 번 실행되므로,
    // 이런 마무리(정리) 작업을 한 곳에만 적어두면 되어 중복을 막고 실수(깜빡하고 빠뜨리는 것)를 줄여준다.
    .finally(() => {
      loadingMessage.textContent = "";
      searchButton.disabled = false;
    });
}

// addEventListener()란?
// "이 요소(searchButton)에서 특정 이벤트(click)가 발생하면,
//  뒤에 적은 함수를 실행해줘" 라고 브라우저에게 등록(예약)해두는 함수다.
// 즉, 버튼을 클릭하는 "사건(event)"이 일어날 때까지 기다리고 있다가,
// 클릭되는 순간 두 번째 인자로 넘긴 함수(콜백 함수)를 자동으로 실행시켜준다.
searchButton.addEventListener("click", performSearch);

// "본문 복사" 버튼을 클릭했을 때 실행되는 로직
copyButton.addEventListener("click", () => {
  // 아직 검색한 결과가 없으면 복사할 내용이 없으므로 안내만 하고 끝낸다
  if (!lastVerse) {
    errorMessage.textContent = "복사할 구절이 없습니다. 먼저 검색해주세요.";
    return;
  }

  // 책 이름 / 장과 절 / 본문을 줄바꿈으로 이어 붙인 텍스트를 만든다
  const textToCopy = `${lastVerse.bookName} ${lastVerse.chapter}:${lastVerse.verse}\n${lastVerse.text}`;

  // Clipboard API란?
  // 브라우저가 운영체제의 클립보드(복사/붙여넣기 저장소)에 접근할 수 있게 해주는 기능이다.
  // navigator.clipboard.writeText(문자열)을 호출하면 그 문자열이 클립보드에 저장되고,
  // fetch()처럼 결과가 나중에 오는 작업이라 Promise를 반환한다.
  // 참고로 클립보드 접근은 사용자 정보를 다루는 민감한 기능이라,
  // "보안 컨텍스트"(HTTPS 또는 localhost)에서만 동작하도록 브라우저가 제한한다.
  // 일반적인 http:// 사이트나 지금처럼 file:// 로 직접 연 페이지에서는
  // 브라우저에 따라 동작하지 않거나 별도 권한 요청이 뜰 수 있다.
  // (실제 서비스로 배포할 때는 HTTPS 주소를 쓰면 이 문제가 자동으로 해결된다)
  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      copyMessage.textContent = "성경 구절이 복사되었습니다.";
    })
    .catch((error) => {
      errorMessage.textContent = "복사에 실패했습니다. 브라우저 권한을 확인해주세요.";
      console.log(error);
    });
});

// ===== 책/장/절을 선택해서 검색하는 기능 =====

// select 요소에 1부터 max까지의 숫자 option을 채워 넣는 함수
function populateNumberOptions(selectElement, max) {
  for (let number = 1; number <= max; number++) {
    const option = document.createElement("option");
    option.value = number;
    option.textContent = number;
    selectElement.appendChild(option);
  }
}

// 책 이름 select 채우기 (BOOK_NAME_TO_SLUG에 있는 66권을 그대로 사용)
Object.keys(BOOK_NAME_TO_SLUG).forEach((bookName) => {
  const option = document.createElement("option");
  option.value = bookName;
  option.textContent = bookName;
  bookSelect.appendChild(option);
});

// 선택된 책의 실제 장 수를 API(GET /v1/books/{책슬러그})로 조회해서
// 장 select를 "그 책에 실제로 있는 장 번호"만으로 채운다
function updateChapterOptions(bookSlug) {
  return fetch(`https://api.midvash.com/v1/books/${bookSlug}`)
    .then((response) => response.json())
    .then((result) => {
      chapterSelect.innerHTML = "";
      populateNumberOptions(chapterSelect, result.data.chapters);
    });
}

// 선택된 책의 특정 장에 실제로 있는 절 수를 API(GET /v1/{번역본}/{책}/{장})로 조회해서
// 절 select를 채운다. 절 수는 장마다 다르므로(예: 예레미야 52장은 34절) 장이 바뀔 때마다 다시 조회한다
function updateVerseOptions(bookSlug, chapter) {
  return fetch(`https://api.midvash.com/v1/${BIBLE_VERSION}/${bookSlug}/${chapter}`)
    .then((response) => response.json())
    .then((result) => {
      verseSelect.innerHTML = "";
      populateNumberOptions(verseSelect, result.meta.total);
    });
}

// 책을 바꾸면: 그 책의 장 목록을 새로 불러오고, 이어서 1장 기준 절 목록도 새로 불러온다
bookSelect.addEventListener("change", () => {
  const bookSlug = BOOK_NAME_TO_SLUG[bookSelect.value];
  updateChapterOptions(bookSlug).then(() => {
    updateVerseOptions(bookSlug, chapterSelect.value);
  });
});

// 장을 바꾸면: 그 장의 절 목록만 새로 불러온다
chapterSelect.addEventListener("change", () => {
  const bookSlug = BOOK_NAME_TO_SLUG[bookSelect.value];
  updateVerseOptions(bookSlug, chapterSelect.value);
});

// 페이지가 열리자마자, 기본으로 선택돼 있는 첫 번째 책(창세기) 기준으로
// 장/절 select를 채워둔다
updateChapterOptions(BOOK_NAME_TO_SLUG[bookSelect.value]).then(() => {
  updateVerseOptions(BOOK_NAME_TO_SLUG[bookSelect.value], chapterSelect.value);
});

// "선택해서 검색" 버튼을 누르면, 선택값으로 "책이름 장:절" 문자열을 만들어
// 입력창에 채운 뒤 기존 performSearch()를 그대로 재사용한다
selectSearchButton.addEventListener("click", () => {
  searchInput.value = `${bookSelect.value} ${chapterSelect.value}:${verseSelect.value}`;
  performSearch();
});

// 페이지를 새로 열었을 때 LocalStorage에서 불러온 최근 검색 기록을 화면에 그려준다
renderRecentSearches();
