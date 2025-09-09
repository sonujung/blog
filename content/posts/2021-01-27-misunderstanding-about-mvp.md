---
title: 사람들이 착각하는 Mvp에 대한 오해
excerpt: >-
  Jason Fried의 'Validation is a mirage'를 읽었다.
  https://m.signalvnoise.com/validation-is-a-mirage 위 아티클의 핵심 메시지는 '제품이 출시되기 전까지
  제품을 검증할 수 있는 방법은 없다.'이다. 많은 사람이 Jason에게 제품 출시 전에 검증을 통해 성공하는 제품을 만드는 방법에 대해
  물어보는데, Jason은 이를 파이에 비유해 설명한다. 한 조각의 파이를 먹으면 전체 파이를...
publishedAt: '2021-01-27'
updatedAt: '2024-03-18'
---

# Jason Fried의 'Validation is a mirage'를 읽었다.
%[https://m.signalvnoise.com/validation-is-a-mirage]

위 아티클의 핵심 메시지는 '제품이 출시되기 전까지 제품을 검증할 수 있는 방법은 없다.'이다.

많은 사람이 Jason에게 제품 출시 전에 검증을 통해 성공하는 제품을 만드는 방법에 대해 물어보는데, Jason은 이를 파이에 비유해 설명한다. 한 조각의 파이를 먹으면 전체 파이를 평가할 수 있겠지만. 제품은 파이와 같지 않으며 모든 것들이 결합하여 전체를 이루어야 검증 가능한 상태가 된다는 것이다.

지극히 베이스캠프 다운 글이라는 생각이 드는 글이다.

제품 업계에 베이스캠프가 갖는 영향력에 비해 국내에선 의외로 모르는 사람들이 많아 간단히 소개하자면, 베이스캠프는 협업 소프트웨어  [Basecamp](https://basecamp.com)와 최근 빠르게 성장 중인 이메일 서비스  [Hey](https://hey.com)를 운영하는 시카고에 위치한(하지만 원격으로 일하는) 소프트웨어 컴퍼니로 그들만의 기업 문화와 제품 철학을 담은 [Rework](https://ridibooks.com/books/222001603), [It doesn't have to be crazy at work](https://ridibooks.com/books/2803000092?_s=search&_q=%EC%A0%9C%EC%9D%B4%EC%8A%A8+%ED%94%84%EB%9D%BC%EC%9D%B4%EB%93%9C), [Remote](https://basecamp.com/books/remote) 등의 책을 내기도 했다. 코파운더인 DHH(David Heinemeier Hansen)은 Ruby on Rails의 Original Author이기도 하다.

다시 Jason의 글로 돌아가면, '검증은 신기루'라는 제목 때문에 이 글은 마치 MVP(Minimum Viable Product)를 부정하는 것처럼 보인다. 아니나 다를까 트위터 타임라인에 이 글에 대한 여러 사람의 목소리가 갑론을박 하고있다.

그런데 사실 글의 내용을 제대로 살펴보면 Jason은 린 스타트업의 MVP의 컨셉을 부정하지 않는다. 그가 부정하는 것은 오히려 MVP에 대한 사람들의 잘못된 기대라고 볼 수 있다.

- “How do you validate if it’s going to work?”
- “How do you know if people will buy it to not?”
- “How do you validate product market fit?”
- “How do you validate if a feature is worth building?”
- “How do you validate a design?”

Jason은 위 질문에 모두 You Can't이라고 답했다.
그러면 부정한 게 맞지 않냐고? 아니다.

여기서 바로잡아야 하는 것은 MVP가 아니라 잘못된 질문이다.

## MVP는 무엇을 위한 것인가?
Jason은 'You Can't' 라고 답한 뒤 바로 이렇게 말한다.

> I mean you can, but not in spirit of the questions being asked. (너는 할 수 있겠지만, 그런 걸 묻는 정신머리로는 안돼.)

이건 어떤 뜻일까?

우선 MVP가 무엇인지 부터 살펴보자.

아래는 고객 개발 방법론의 창시자로 불리우는 [스티브 블랭크가 MVP를 설명하는 방법](https://steveblank.com/2013/07/22/an-mvp-is-not-a-cheaper-product-its-about-smart-learning/)이다.

> An MVP is not a Cheaper Product, It’s about Smart Learning. Defining the goal for a MVP can save you tons of time, money and grief.

그 다음은 린스타트업의 저자 [에릭 리스가 MVP를 설명하는 방법](https://leanstartup.co/what-is-an-mvp/)이다.

> the minimum viable product is that version of a new product which allows a team to collect the maximum amount of validated learning about customers with the least effort.

MVP의 개념을 정의하고 널리 알린 두 사람 모두 MVP는 최소의 비용으로 고객에 대해 의미 있는 배움을 얻을 수 있는 수단이라고 정의한다.

즉 MVP는 제품을 만들기 전에 창업가의 비즈니스 아이디어를 저렴한 비용에 그들의 잠재 고객에게 효과적으로 전달(Present)하고 그들의 관심 여부를 평가하는 행위를 반복하여 시장과 고객에 대한 직관(Intuition = Hunch, Feeling, Belief)을 높여가는 프로세스를 의미한다고 볼 수 있다.

그리고 이 프로세스를 반복하며 팀의 머릿속에 '**고객이 원하는 제품 가설**'을 구체화 하는 것이 목적이다.

그런데 앞서 질문한 사람들은 '시장에서 성공할 수 있을지', '사람들이 구매할지', '이 기능을 좋아할지', '이렇게 설계하면 될지' 등 제품을 출시하지 않고서는 알 수 없는, 예언에 가까운 정답을 찾고 있기 때문에 넌센스가 되어버리는 것이다.

마치 귀 후비는 도구로 등을 긁는 것처럼 좋은 도구를 가져다 엉뚱한 곳에 사용하는 셈이다.

Jason은 이 점을 지적한 것이 아니었을까?

## MVP는 어떻게 활용해야 할까?
성공적인 MVP 사례를 꼽을 때 드랍박스 이야기는 빠지지 않는다.

드랍박스는 제품 출시 전 제품의 작동 방식을 담은 [프로토타입 비디오](https://techcrunch.com/.../dropbox-minimal-viable-product/)를 먼저 선보였고 많은 사람들의 관심을 이끌어냈다.

아래 2007년 드랍박스의 창업자 Drew Houston이 YCombinator에 지원할 때 제출한 지원서 *([출처: 지원준님 블로그](https://m.blog.naver.com/welchs0102/90193000497))* 중 일부 내용을 살펴보자.

**YC: 당신의 회사는 무엇을 만들 것입니까?**
> **Drew:**
> 드랍박스는 사용자의 컴퓨터를 동기화 합니다. 드랍박스는 별도의 업로드나 이메일을 통하지 않고 사용자의 윈도우 디스크를 자동으로 동기화 하며, 이미 사용자에 익숙한 방식이라 훨씬 편리합니다. 웹 인터페이스 또한 있으며, 파일들은 아마존S3에 안전하게 저장됩니다. 드랍박스는 subversion, trac, rsync 의 가장 좋은 요소들만 뽑아와 일반적인, 평범한 개인이나 팀에게 "딱 맞도록" 만든 것입니다. 컴퓨터에 능숙한 사람은 위의 서비스들 사용이 쉽지만, 일반 사람들은 접근하기 힘들죠.

**YC: 당신이 하는 일이 새로운 이유가 무엇입니까?**
> **Drew:**
> 수많은 작은 팀들은 기본적인 니즈가 있습니다.
>    1. 중요한 것들이 어디서든 손에 닿을 거리에 있어야 합니다.
>    2. 모든 사람이 가장 최신 버젼의 서류를 가지고 일해야하며, 어떻게 수정되었는지 추적할 수 있는 것이 가장 이상적입니다.
>    3. 팀이 쌓은 데이터들은 재난으로부터 지켜져야 합니다. 동기화 툴들(beinsync, Foldershare)도 있고, 백업 툴(Carbonite, Mozy)도 있으며, 업로딩/퍼블리싱 툴(box.net 등등)도 있습니다. 그러나 그 모두를 통합할 수 있는 솔루션은 없죠.

Drew는 사람들이 더욱 편리한 파일 공유 방식에 관심이 있을거라는 가설을 가지고 있다.

그런데 이것을 제품으로 출시하려면 상당히 많은 시간이 소요된다. 특히 유려한 사용자 경험이 핵심 가치인 만큼 구현 난이도는 더욱 올라간다.

가용한 모든 시간을 제품 개발에 투자했다가 자금이 말라버리면 제품이 있어도 정작 사업을 접게될 수도 있기 때문에 떠올린 것이 출시할 제품의 사용 방식을 거의 동일하게 구사한 데모 비디오였다.

다행히 비디오는 사람들의 관심을 끌었고 드랍박스의 비전이 투자할만한 가치를 가지고 있음을 수치화된 증거로 보여주었다. 이를 통해 팀은 시간과 자원을 확보할 수 있었고 1년 뒤 드랍박스의 첫 제품을 출시하였다.

## 제품의 성공을 보장하는 답안지는 없다.

**자 그러면 여기서 질문:**

> 당신은 지금 엄청난 아이디어를 가지고 있다. 만약 당신이 드랍박스가 그러했듯 당신의 아이디어를 비디오로 만들어 먼저 선보이면 당신은 성공할 수 있을까?

> ⚠️ Spoiler Alert: **No!**

과학자들이 실험하는 방식을 떠올려보자. 가설을 수립하고 실험을 설계하고, 수행하고, 그 결과를 반영해 다시 가설을 조정한다.

실험에는 언제나 결과가 따르지만, 실험을 많이 한다고 결과가 '증명'으로 이어지는 것은 아니다.

우리는 앞서 드랍박스의 이야기를 살펴봤다, 우선 YC 지원서를 살펴보면 Drew는 시장과 고객에 대해 높은 직관과 인사이트를 가지고 있었다. 그래서 그가 세운 가설은 MVP를 통해 시장에서 반응을 끌어냈다. 거기에 Drew를 포함한 드랍박스 팀은 MIT를 나온 뛰어난 엔지니어였다. 사람들이 반응한 컨셉을 높은 퀄리티의 제품으로 구현해냈다.

만약 Drew 팀의 가설이 잠재고객의 반응을 끌어내지 못했거나 비디오 공개 후 1년 사이에 동일 수준 이상의 경험을 제공하는 데 실패했다면 어찌됐을까?

지금의 드랍박스는 없었을지도 모른다.

Marty Cagan은 잘 알려진 저서 인스파이어드를 통해 제품이 만들어지는 과정을 크게 **제품 발견**(Product Discovery)과 **제품 실행**(Product Execution) 단계로 나누어 정의한다.

드랍박스가 그랬듯 제품 발견과 제품 실행 단계 중 어느 것 하나 빠지는 것 없이 뛰어난 역량으로 수행했을 때 만들어지는 제품을 우리는 '고객이 원하는 좋은 제품'이라고 부른다.

그런데 [고객이 원하는]게 무엇인지 아는 것도 [좋은 제품]을 만들려면 무엇을 해야 하는지도 쉽게 알 수 없기 때문에 사람들은 책과 인터넷, 유명인사나 기업이 말하는 것들에 기대곤 한다.
*(참고: [폴 그레이엄 - 우리가 버려야 할 습관](https://sonujung.com/note-2020-04-25))*


Jason이 비판하던 질문자들이 딱 좋은 예시이다.

나는 성공하는 제품을 만드는 일에 답안지는 없다고 생각한다. 제품을 출시하고 고객을 만나서 그들의 사랑을 받을 때까지 그들과 끊임없이 소통하고 제품을 개선해 나가는 방법뿐이다. 그리고 우리의 제품과 우리의 고객 사이에 힌트가 숨어있는 만큼 성공을 거둔다면 그것은 우리만의 방식이 될 것이다.

린하고, 애자일하게 만든다고 좋은 제품이 탄생하는 것도 아니고.
대표 마음대로 뚝딱 만든다고 좋은 제품이 될 수 없는 것도 아니다.

와이컴비네이터의 창업자 폴 그레이엄은 이렇게 말했다.
> 'Lunch early, Learn Often'

Fog Creek(Glitch, Trello, Stack overflow...)의 창업자 조엘 스폴스키는 이렇게 말한다.
> 'Launch when it doesn't completely suck.'

에버노트의 창업자 필 리빈은 이렇게 말했다.
> If you're making a product for you, you can know when it's getting better.”

모두 다 각자의 방식이 있다.

그러니 다른 곳을 보지 말고 우리 제품을 사용하는 고객의 니즈와 그것을 해결하기 위한 실행에 집중하자.

---

잘 읽으셨나요? 혹시 이 글이 도움이 되셨다면 아래 버튼을 눌러 커피 한 잔 어떠세요?
여러분의 작은 후원이 창작자에게 큰 힘이 됩니다! 😁
