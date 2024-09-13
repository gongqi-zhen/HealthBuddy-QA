import { useState, useRef, useEffect } from "react";
import { auth } from "lib/firebase";

export default function HealthBuddyQA() {

  const initialMessage = "質問をどうぞ";
  const chatDataInit = [
    { "user": "bot", "text": initialMessage }
  ];
  const initialBPTextMessage = `
血圧計の測定結果についてご意見を伺いたいです。

1. 血圧の現在の数値は次の通りです。
   - 収縮期血圧（最高血圧）: ◯◯◯ mmHg
   - 拡張期血圧（最低血圧）: ◯◯◯ mmHg

2. これらの血圧値から考えられることを教えてください。
   具体的には、以下の点について回答をお願いします。
   
   - 現在の血圧値は正常範囲内ですか？または注意が必要な状態ですか？
   - どのようなことに注意しながら生活すべきですか？

3. 血圧を管理するために役立つ特定保健用食品を提案してください。
   以下の情報を含めてください。
  
   - 商品名
   - 申請者（メーカー名）
   - 許可を受けた表示内容（機能や効果に関する記述）
   - 摂取する上での注意事項
   - 1日あたりの摂取目安量

これらの情報を踏まえ、
血圧管理に関するアドバイスをわかりやすく教えてください。
`;
  const initialBloodGlucoseLevelTextMessage = `
血糖値の測定結果についてご意見を伺いたいです。

1. 血糖値とHbA1cの現在の数値は次の通りです。
   - 空腹時血糖値 : ◯◯◯ mg/dL
   - 食後2時間血糖値 : ◯◯◯ mg/dL
   - HbA1c : ◯◯◯ %

2. これらの血糖値から考えられることを教えてください。
   具体的には、以下の点について回答をお願いします。
  
   - 現在の血糖値とHbA1cの値は正常範囲内ですか？または注意が必要な状態ですか？
   - 血糖値とHbA1cを管理する上でどのようなことに注意しながら生活すべきですか？

3. 血糖値とHbA1cを管理するために役立つ特定保健用食品を提案してください。
   以下の情報を含めてください。
   
   - 商品名
   - 申請者（メーカー名）
   - 許可を受けた表示内容（機能や効果に関する記述）
   - 摂取する上での注意事項
   - 1日あたりの摂取目安量

これらの情報を踏まえ、
血糖値管理に関するアドバイスをわかりやすく教えてください。
`;
  
  const initialBoneMineralDensityTextMessage = `
骨密度の測定結果についてご意見を伺いたいです。

1. 骨密度の現在の測定値は次の通りです。
   - 腰椎（L1-L4）の骨密度 : ◯◯◯ g/cm²
   - 大腿骨近位部（大腿骨頸部）の骨密度 : ◯◯◯ g/cm²
   - 全身平均骨密度 : ◯◯◯ g/cm²

2. これらの骨密度値から考えられることを教えてください。
   具体的には、以下の点について回答をお願いします。
  
   - 現在の骨密度値は正常範囲内ですか？または注意が必要な状態ですか？
   - 骨密度を維持または改善するために、どのような生活習慣や対策を取るべきですか？

3. 骨密度を改善または維持するために役立つ特定保健用食品やサプリメントを提案してください。
   以下の情報を含めてください。
   - 商品名
   - 申請者（メーカー名）
   - 許可を受けた表示内容（機能や効果に関する記述）
   - 摂取する上での注意事項
   - 1日あたりの摂取目安量

これらの情報を踏まえ、
骨密度管理に関するアドバイスをわかりやすく教えてください。
`;
  const initlalSupportTextMessage = `
私の名前は 鈴木 です。

今日久しぶりにレストランに行ってきた。
隣のテーブルにカップルが座っていて、ウェーターが料理を持ってきた。
「鈴木でございます」とウェーターが言った。

男の方が「佐藤でございます」、女の方が「田中でございます」と言った。

ウェーターは肩を小刻みに震わせながら、「本日のお勧めの魚のスズキでございます」と説明していた。

ささやかな血圧の高まりを感じたので、一つ特定保健用食品を提案してください。
乾燥スープかゼリーでお願いします。
`;

  const messageEnd = useRef(null);
  const inputRef = useRef(null);
  const [chatData, setChatData] = useState(chatDataInit);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [inputText, setInputText] = useState("");

  const handleButtonClick = (text) => {
    setInputText(text);
  };

  // Automatically scrolling up to show the last message.
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  useEffect(() => {
    const scrollUp = async () => {
      await sleep(500);
      messageEnd.current?.scrollIntoView();
    };
    scrollUp();
  });


  const getAnswer = async () => {
    const callBackend = async (question) => {
      const apiEndpoint = "/api/question";
      const token = await auth.currentUser.getIdToken();
      const uid = auth.currentUser.uid;
      const request = {  
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          uid: uid,
          question: question,
        })
      };
      const res = await fetch(apiEndpoint, request);
      const data = await res.json();
      return data;
    };

    setButtonDisabled(true);

    const question = inputText.replace(/\r?\n/g, '');

    let chatDataNew = chatData.concat(); // clone an array
    chatDataNew.push({"user": "human", "text": inputText});
    chatDataNew.push({"user": "bot", "text": "_typing_"});
    setChatData(chatDataNew);

    const data = await callBackend(question);
    chatDataNew.pop();
    chatDataNew.push({"user": "bot", "text": data.answer});

    if (data.source.length > 0) {
      let infoSource = "[情報源]";
      for (const item of data.source) {
        infoSource += "\n" + item.filename + " (p." + item.page + ")"
      }
      chatDataNew.push({"user": "info", "text": infoSource});
    }
    setChatData(chatDataNew);
    setInputText("");

    setButtonDisabled(false);
  };


  const textStyle = {
    width: "400px", padding: "10px", marginBottom: "20px",
    border: "1px solid #333333", borderRadius: "10px",
  };
  const infoStyle = {
    width: "400px", padding: "10px", marginBottom: "20px",
    backgroundColor: "#f0f0f0", whiteSpace: "pre-wrap",
  };
  const loadingStyle = { width: "100px", marginLeft: "120px" };
  const chatBody = [];
  let i = 0;
  for (const item of chatData) {
    i += 1;

    if (item.user === "bot") {
      let elem;
      if (item.text === "_typing_") {
        elem = (
          <div key={i}>
            <img src="/loading.gif" alt="loading" style={loadingStyle} />
          </div>
        );
      } else {
        elem = (
          <div key={i} style={textStyle}>
            {item.text}
          </div>
        );
      };
      chatBody.push(elem);
    }

    if (item.user === "info") {
      const elem = (
        <div key={i} style={infoStyle}>
          {item.text}
        </div>
      );
      chatBody.push(elem);
    }

    if (item.user === "human") {
      const elem = (
          <div key={i} align="right">
            <div style={textStyle}>
              {item.text}
            </div>
          </div>
      );
      chatBody.push(elem);
    }
  }

  let inputElement;
  if (buttonDisabled === false) {
    inputElement = (
      <>

      {/* ボタンのリスト */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => handleButtonClick(initialBPTextMessage)}>血圧</button>
        <button onClick={() => handleButtonClick(initialBloodGlucoseLevelTextMessage)}>血糖値</button>
        <button onClick={() => handleButtonClick(initialBoneMineralDensityTextMessage)}>骨密度</button>
        <button onClick={() => handleButtonClick(initlalSupportTextMessage)}>雑談</button>
      </div>

      <div align="right">
        <textarea style={{resize: "none", width: "530px", height: "380px"}}
	          value={inputText}
                  onChange={(event) => setInputText(event.target.value)} />
      </div>            
      <div align="right">
        <button disabled={buttonDisabled}
	        onClick={getAnswer}>Submit</button>
      </div>
      </>
    );
  } else {
    inputElement = (
	    <></>
    );
  }

  const element = (
    <>
      {chatBody}
      {inputElement}
      <div ref={messageEnd} />
    </>
  );

  return element;
}
