# script.js 학습 가이드

성경 구절 검색 앱의 `script.js`를 15개 주제로 나눠 분석한 학습 자료입니다.

## 1. DOM 요소 가져오기 (1~13번 줄)

```js
const searchInput = document.getElementById("search-input");
```

**이 코드가 하는 일**: HTML에 있는 태그를 자바스크립트 변수에 연결해서, 이후 코드에서 그 태그의 값을 읽거나 바꿀 수 있게 한다.

**왜 필요한가**: 자바스크립트는 HTML과 원래 별개의 파일이라, `id`를 통해 "이 변수가 화면의 어떤 요소를 가리키는지" 미리 연결해둬야 조작할 수 있다.

**초보자가 꼭 기억할 부분**: `getElementById()`는 HTML에 그 `id`를 가진 태그가 이미 존재해야 찾을 수 있다. 그래서 `<script>` 태그를 `</body>` 바로 앞에 둔 것처럼, HTML이 먼저 로드된 뒤에 script.js가 실행되도록 순서를 맞춰야 한다.

## 2. 이벤트 처리 (201, 204, 277, 285, 298번 줄)

```js
searchButton.addEventListener("click", performSearch);
```

**이 코드가 하는 일**: "이 요소에서 이 이벤트가 발생하면, 이 함수를 실행해줘"라고 브라우저에 등록해둔다.

**왜 필요한가**: 사용자가 언제 버튼을 누를지, 언제 select를 바꿀지 미리 알 수 없다. 이벤트 리스너는 "그 순간이 오면 실행"되도록 대기시켜주는 장치다.

**초보자가 꼭 기억할 부분**: `addEventListener`는 함수를 **호출**하는 게 아니라 함수 **자체**를 넘겨야 한다. `performSearch` (괄호 없음)와 `performSearch()` (괄호 있음, 즉시 실행)의 차이를 헷갈리면 안 된다.

## 3. 사용자 입력 (56~58, 122~123번 줄)

```js
const keyword = searchInput.value;
```

**이 코드가 하는 일**: `<input>` 태그에 사용자가 타이핑한 현재 텍스트를 가져온다.

**왜 필요한가**: 이 값이 있어야 어떤 구절을 검색할지 알 수 있다. `.value`는 실시간으로 바뀌므로, 버튼을 누른 "그 순간"에 읽어야 정확하다.

**초보자가 꼭 기억할 부분**: `.textContent`는 화면에 표시된 텍스트를 읽거나 바꿀 때, `.value`는 `<input>`/`<select>`처럼 사용자가 입력·선택하는 요소의 값을 읽을 때 쓴다. 이 둘을 섞어 쓰면 동작하지 않는다.

## 4. API URL 만들기 (41~54, 161번 줄)

```js
fetch(`https://api.midvash.com/v1/${BIBLE_VERSION}/${bookSlug}/${chapter}/${verse}`)
```

**이 코드가 하는 일**: 사용자가 입력한 "요한복음 3:16"을 `parseReference()`로 분해하고, `BOOK_NAME_TO_SLUG` 매핑표로 API가 이해하는 영어 슬러그(`john`)로 바꾼 뒤, 백틱( ` )과 `${}`로 URL 문자열을 조립한다.

**왜 필요한가**: 사람이 읽기 편한 한글 표현과, API가 요구하는 정확한 URL 형식은 다르다. 그 변환 과정이 없으면 API가 요청을 이해하지 못한다.

**초보자가 꼭 기억할 부분**: 백틱(템플릿 리터럴)을 쓰면 `+`로 문자열을 이어 붙이지 않고 `${변수}` 형태로 값을 바로 끼워 넣을 수 있다.

## 5. fetch() (161, 257, 268번 줄)

```js
fetch(`...`)
  .then((response) => { ... })
```

**이 코드가 하는 일**: 지정한 URL로 네트워크 요청을 보내고, 결과가 나중에 채워질 상자인 **Promise**를 즉시 돌려준다.

**왜 필요한가**: 네트워크 요청은 시간이 걸리는 작업이다. `fetch()`가 응답을 기다리는 동안 코드가 멈춰버리면(동기 처리) 화면 전체가 얼어붙는다. `fetch()`는 기다리지 않고 바로 다음 코드로 넘어가면서, 응답이 오면 나중에 처리할 수 있게 해준다(비동기 처리).

**초보자가 꼭 기억할 부분**: `fetch()`는 서버가 400/404 같은 에러 상태를 응답해도 **거부(reject)되지 않는다**. 그래서 164번 줄처럼 `response.ok`를 직접 확인해야 한다.

## 6. async/await

> 참고: 이 프로젝트의 코드는 실제로 `async/await`를 쓰지 않고, `.then()` / `.catch()` / `.finally()`를 체인으로 이어 붙이는 방식(Promise 체이닝)을 썼습니다. 개념은 설명하지만 코드 자체는 바꾸지 않았습니다.

**이 코드가 하는 일**: `async/await`는 Promise를 다루는 또 다른 문법이다. 함수 앞에 `async`를 붙이고, Promise를 반환하는 코드 앞에 `await`를 붙이면 "이 결과가 올 때까지 기다렸다가 다음 줄로 넘어가라"는 뜻이 된다.

**왜 필요한가**: `.then()`을 여러 번 체인으로 이으면 코드가 옆으로 길게 늘어지는데(특히 조건 분기가 많아지면), `async/await`를 쓰면 마치 동기 코드처럼 위에서 아래로 순서대로 읽혀서 가독성이 좋아진다.

**초보자가 꼭 기억할 부분**: 지금 코드를 `async/await`로 바꾸면 이런 모습이 된다 (개념 비교용):

```js
async function performSearch() {
  // ...앞부분 동일...
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("구절을 찾을 수 없습니다.");
    const result = await response.json();
    resultArea.textContent = result.data.text;
  } catch (error) {
    errorMessage.textContent = "검색 중 오류가 발생했습니다...";
  } finally {
    loadingMessage.textContent = "";
    searchButton.disabled = false;
  }
}
```

`.then()`과 `async/await`는 결국 같은 Promise 위에서 동작하는 **문법만 다른 두 가지 표현**이라는 점이 핵심이다.

## 7. response 처리 (162~167번 줄)

```js
.then((response) => {
  if (!response.ok) {
    throw new Error("구절을 찾을 수 없습니다.");
  }
  return response.json();
})
```

**이 코드가 하는 일**: `fetch()`가 돌려준 1차 응답(`response`) 객체를 확인해서, 정상 응답(`response.ok === true`)인지 먼저 검사한다.

**왜 필요한가**: `response`는 아직 "응답이 도착했다"는 정보만 담긴 객체이지, 실제 성경 구절 데이터가 아니다. 상태 코드 확인은 이 단계에서만 할 수 있다 (JSON으로 변환한 뒤에는 상태 코드 정보가 사라진다).

**초보자가 꼭 기억할 부분**: `response.ok`가 `false`일 때 `throw`로 에러를 던지면, 뒤에 이어지는 `.then()`은 건너뛰고 바로 `.catch()`로 넘어간다. 이 흐름 제어가 핵심이다.

## 8. JSON 변환 (170, 258, 269번 줄)

```js
return response.json();
```

**이 코드가 하는 일**: 서버가 보낸 응답 본문(순수 텍스트)을 자바스크립트 객체/배열로 파싱한다. 이 작업도 시간이 걸리므로 또 다른 Promise를 반환한다.

**왜 필요한가**: 네트워크로 오가는 데이터는 결국 문자열이다. `{data: {...}}`처럼 자바스크립트 코드에서 `.` 으로 접근하며 쓰려면 실제 객체로 변환해야 한다.

**초보자가 꼭 기억할 부분**: `.json()`도 Promise이기 때문에, 바로 값을 쓸 수 없고 다음 `.then()`에서 받아야 한다. `response.json()`을 `return`하는 걸 깜빡하면 다음 `.then()`에 `undefined`가 넘어간다.

## 9. 데이터 추출 (174, 177, 261, 272번 줄)

```js
resultArea.textContent = result.data.text;
```

**이 코드가 하는 일**: JSON으로 변환된 전체 응답 객체(`result`)에서 실제로 필요한 값(`result.data.text`, `result.data.chapters`, `result.meta.total`)만 꺼낸다.

**왜 필요한가**: API 응답에는 `data`, `meta` 등 여러 정보가 함께 담겨 있다. 그중 화면에 쓸 값만 정확히 짚어내야 한다.

**초보자가 꼭 기억할 부분**: API 응답 구조는 API마다 다르다. `result.text`가 아니라 `result.data.text`인 것처럼, 실제 응답을 `console.log()`로 한번 찍어보고 정확한 경로를 확인하는 습관이 중요하다.

## 10. 화면 표시 (148, 174, 226, 260~261, 271~272번 줄)

```js
resultArea.textContent = result.data.text;
```

**이 코드가 하는 일**: 자바스크립트가 가진 값을 HTML 요소의 `.textContent`(또는 `.innerHTML`, `.value`)에 대입해서 사용자 눈에 보이게 만든다.

**왜 필요한가**: 데이터를 변수에 담아두는 것과, 그 데이터를 실제로 사용자가 "보는" 것은 다른 단계다. 화면 표시 코드가 없으면 콘솔에만 찍히고 UI는 그대로다.

**초보자가 꼭 기억할 부분**: 사용자가 입력한 값이나 API가 준 값을 그대로 HTML에 넣을 때는 `.innerHTML` 대신 `.textContent`를 쓰는 게 안전하다. `.innerHTML`은 문자열을 HTML 태그로 해석해버려서 예상치 못한 코드가 실행될 수 있다(XSS 위험).

## 11. try/catch 오류 처리 → 이 코드에서는 `.catch()`가 그 역할 (180~183, 228~231번 줄)

```js
.catch((error) => {
  errorMessage.textContent = "검색 중 오류가 발생했습니다...";
  console.log(error);
})
```

**이 코드가 하는 일**: `.then()` 체인 중 어디선가 에러가 발생하면(네트워크 실패, 또는 7번에서 직접 `throw`한 에러), 이 자리로 한 번에 모여서 처리된다.

**왜 필요한가**: 에러 처리가 없으면 네트워크가 끊기거나 존재하지 않는 구절을 검색했을 때 아무 반응 없이 조용히 실패하거나, 콘솔에만 빨간 에러가 남고 사용자는 무슨 일이 일어났는지 알 수 없다.

**초보자가 꼭 기억할 부분**: `try/catch`는 `async/await`와 짝을 이루는 문법이고, `.catch()`는 `.then()` 체인과 짝을 이루는 문법이다. 이 프로젝트는 후자를 썼다. 둘 다 "실패했을 때를 대비한 안전망"이라는 목적은 같다.

## 12. finally (190~193번 줄)

```js
.finally(() => {
  loadingMessage.textContent = "";
  searchButton.disabled = false;
});
```

**이 코드가 하는 일**: 성공(`.then()`)했든 실패(`.catch()`)했든 상관없이 맨 마지막에 반드시 한 번 실행된다.

**왜 필요한가**: "로딩 메시지 숨기기"와 "버튼 다시 활성화하기"는 성공/실패 여부와 무관하게 반드시 해야 하는 마무리 작업이다. `.finally()` 없이 `.then()`과 `.catch()`에 각각 따로 적으면 코드가 중복되고, 나중에 한쪽만 고치는 실수가 생기기 쉽다.

**초보자가 꼭 기억할 부분**: `finally`는 정리(clean-up) 전용이다. 성공/실패에 따라 다른 일을 해야 하는 로직은 여기 넣지 않는다.

## 13. LocalStorage (62~74번 줄)

```js
localStorage.setItem(STORAGE_KEY, JSON.stringify(recentSearches));
const saved = localStorage.getItem(STORAGE_KEY);
return saved ? JSON.parse(saved) : [];
```

**이 코드가 하는 일**: 브라우저에 내장된 저장소에 데이터를 문자열로 저장하고(`setItem`), 나중에 다시 꺼내온다(`getItem`).

**왜 필요한가**: 자바스크립트 변수는 새로고침하면 사라진다. 새로고침 후에도 검색 기록을 유지하려면 브라우저에 직접 저장해야 한다.

**초보자가 꼭 기억할 부분**: LocalStorage는 **문자열만** 저장할 수 있다. 배열이나 객체를 저장하려면 `JSON.stringify()`로 문자열로 바꿔서 저장하고, 꺼낼 때는 `JSON.parse()`로 다시 배열/객체로 되돌려야 한다.

## 14. 검색 기록 (76~117번 줄)

```js
const existingIndex = recentSearches.indexOf(keyword);
if (existingIndex !== -1) recentSearches.splice(existingIndex, 1);
recentSearches.unshift(keyword);
if (recentSearches.length > MAX_RECENT_SEARCHES) {
  recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
}
```

**이 코드가 하는 일**: 배열을 이용해 "최근 검색"이라는 기능 하나를 통째로 관리한다 — 중복 제거(`indexOf` + `splice`), 맨 앞 추가(`unshift`), 최대 개수 제한(`slice`), 저장(`saveRecentSearches`), 화면 그리기(`renderRecentSearches`)까지 한 세트다.

**왜 필요한가**: "같은 검색어는 최신 위치로 옮기고, 10개까지만 유지한다"는 요구사항을 배열 메서드 조합으로 정확히 구현하기 위함이다.

**초보자가 꼭 기억할 부분**: `renderRecentSearches()`는 매번 목록을 통째로 비우고(`innerHTML = ""`) 다시 그린다. 이렇게 해야 배열의 최신 순서가 화면에도 정확히 반영된다 — 일부만 수정하려 들면 순서가 꼬이기 쉽다.

## 15. Clipboard API (223~231번 줄)

```js
navigator.clipboard.writeText(textToCopy)
  .then(() => { copyMessage.textContent = "성경 구절이 복사되었습니다."; })
  .catch((error) => { ... });
```

**이 코드가 하는 일**: 브라우저가 OS의 클립보드에 접근해서 문자열을 복사해 넣는다. 이것도 Promise를 반환하는 비동기 작업이다.

**왜 필요한가**: 사용자가 본문을 직접 드래그해서 복사하지 않고 버튼 한 번으로 복사할 수 있게 해서 사용성을 높인다.

**초보자가 꼭 기억할 부분**: 클립보드 접근은 보안상 민감한 기능이라 HTTPS나 localhost 같은 "보안 컨텍스트"에서만 안정적으로 동작한다. `file://`로 열었을 때는 실패할 수 있다는 걸 기억해야 한다.

---

## 전체 흐름 (한 장 순서도)

```
[페이지 로드]
   │
   ├─ 1) DOM 요소 연결 (const searchInput = ... 등, 1~13줄)
   ├─ 2) 책 select 채우기 + 기본 장/절 select 채우기 (247~294줄)
   └─ 3) LocalStorage에서 최근 검색 불러와 화면에 그리기 (78, 304줄)
   │
   ▼
[사용자 행동 — 3가지 입구 중 하나]
   │
   ├─ (A) 입력창에 직접 타이핑 + 검색 버튼 클릭 (201줄)
   ├─ (B) 책/장/절 select 선택 + "선택해서 검색" 클릭 (298~301줄)
   └─ (C) "최근 검색" 항목 클릭 (110~113줄)
   │        └─ 세 경우 모두 결국 performSearch() 하나로 합류
   ▼
[performSearch() 시작] (121줄)
   │
   ├─ 입력값 읽기 → 비어있음? ──예──▶ 오류 메시지 표시 후 종료
   │        │ 아니오
   ├─ parseReference()로 파싱 → 형식 이상함? ──예──▶ 오류 메시지 표시 후 종료
   │        │ 정상
   ├─ 최근 검색 목록에 추가 + LocalStorage 저장 (81~98줄)
   ├─ 로딩 메시지 표시 + 검색 버튼 비활성화 (150, 153줄)
   │
   ▼
[fetch() → API 요청 전송] (161줄)
   │
   ├─ 응답 도착 → response.ok?
   │      ├─ 예(정상) ──▶ .json()으로 변환 ──▶ 본문을 화면에 표시 + lastVerse 저장
   │      └─ 아니오/네트워크 실패 ──▶ throw / reject
   │
   ▼
[.catch()] 실패 시 오류 메시지 표시 (180줄)
   │
   ▼
[.finally()] 성공이든 실패든 항상 실행:
   로딩 메시지 지우기 + 검색 버튼 다시 활성화 (190줄)
   │
   ▼
[사용자가 "본문 복사" 클릭 시 — 별도 흐름] (204줄)
   └─ lastVerse 있음? → Clipboard API로 복사 → 복사 완료 메시지 표시
```

핵심은 이 앱 전체가 딱 하나의 패턴 반복이라는 점입니다: **"무언가 시간이 걸리는 작업(fetch, json 변환, clipboard) → Promise → .then()으로 성공 처리, .catch()로 실패 처리, .finally()로 항상 정리"**. 이 패턴 한 번만 완전히 이해하면 15개 항목 중 5~12번은 사실 하나의 개념을 여러 각도에서 본 것에 불과합니다.
