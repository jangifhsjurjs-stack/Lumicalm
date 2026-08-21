// Text-Based Sentiment Analysis and Relaxation State Simulator for Lunicalm

class TextSentimentService {
  constructor() {
    this.analyzerName = "Text-Based Sentiment Analyzer Engine";
  }

  // Generate customized relaxation profile from user input text
  async generateTherapyProfile(userInput) {
    console.log("Analyzing text input with local Sentiment Engine...");
    const profile = this.runTextAnalysis(userInput);
    return {
      profile,
      mode: 'analyzed'
    };
  }

  // Pure Client-Side Text Sentiment Analyzer
  runTextAnalysis(userInput) {
    const input = (userInput || "").toLowerCase();

    // 1. Stress / Anxiety / Pressure (ความเครียด และ ความกังวล)
    if (input.includes("เครียด") || input.includes("กังวล") || input.includes("ตื่นเต้น") || input.includes("กดดัน") || input.includes("วิตก") || input.includes("ภาระ") ||
        input.includes("stress") || input.includes("anxious") || input.includes("panic") || input.includes("fear") || input.includes("pressure") || input.includes("nervous") || input.includes("worry")) {
      return {
        colorHex: "#66bb6a", // 525nm Green
        colorReason: "คลื่นแสงสีเขียว 525 นาโนเมตร สร้างสภาวะแวดล้อมที่สบายตา ช่วยลดความรู้สึกเกร็งของกล้ามเนื้อและส่งเสริมบรรยากาศการผ่อนคลายทางอารมณ์",
        techniqueName: "โปรแกรมผ่อนคลายความเครียดสะสม (4-7-8 Relaxing)",
        tagline: "จังหวะฝึกเพื่อคืนความผ่อนคลายและความสงบทางอารมณ์อย่างนุ่มนวล",
        phases: [
          { label: "หายใจเข้าผ่อนคลาย", duration: 4, type: "in" },
          { label: "กลั้นพักสติ", duration: 7, type: "hold" },
          { label: "หายใจออกระบายความสับสน", duration: 8, type: "out" }
        ],
        affirmation: "ปล่อยวางความกังวลชั่วคราว ยอมรับสภาวะปัจจุบัน ปล่อยให้ร่างกายและจิตใจค่อยๆ เบาสบายขึ้น",
        emotionProfile: {
          category: "stress",
          primary: { label: "วิตกกังวล", labelEn: "Anxious", intensity: 8 },
          secondary: [
            { label: "เครียดสะสม", labelEn: "Stressed", intensity: 7 },
            { label: "กดดัน", labelEn: "Pressured", intensity: 6 }
          ],
          reflection: "รู้สึกเหมือนคุณกำลังเผชิญกับภาระหรือความกดดันหลายอย่างในเวลาเดียวกัน"
        }
      };
    }

    // 2. Insomnia / Exhaustion / Sleep Request (นอนไม่หลับ และ ความอ่อนล้าสะสม)
    if (input.includes("นอนไม่หลับ") || input.includes("เหนื่อย") || input.includes("เพลีย") || input.includes("ล้า") || input.includes("อยากนอน") || input.includes("ฝันร้าย") ||
        input.includes("sleep") || input.includes("insomnia") || input.includes("exhausted") || input.includes("tired") || input.includes("burnout") || input.includes("fatigue")) {
      return {
        colorHex: "#ab47bc", // 400nm Violet
        colorReason: "ความยาวคลื่นแสงสีม่วง 400 นาโนเมตร ให้ความรู้สึกสงบนิ่ง เหมาะกับการสร้างบรรยากาศก่อนนอนและลดความคิดวนเวียนก่อนการพักผ่อน",
        techniqueName: "จังหวะเตรียมพร้อมสำหรับการนอน (Deep Calm 4-2-4-2)",
        tagline: "ผ่อนคลายความล้าสะสม เตรียมพร้อมร่างกายเข้าสู่สภาวะพักผ่อนอย่างเต็มที่",
        phases: [
          { label: "หายใจเข้าช้าๆ", duration: 4, type: "in" },
          { label: "กลั้นพักจิต", duration: 2, type: "hold" },
          { label: "หายใจออกผ่อนคลาย", duration: 4, type: "out" },
          { label: "กลั้นพักนิ่ง", duration: 2, type: "hold" }
        ],
        affirmation: "ละทิ้งความเหน็ดเหนื่อยของวัน ปล่อยให้ความคิดสงบลง ร่างกายพร้อมสำหรับการพักผ่อนอย่างแท้จริง",
        emotionProfile: {
          category: "sleep",
          primary: { label: "เหนื่อยล้าสะสม", labelEn: "Exhausted", intensity: 8 },
          secondary: [
            { label: "หมดพลัง", labelEn: "Burnout", intensity: 7 },
            { label: "ความคิดวนเวียน", labelEn: "Restless Mind", intensity: 6 }
          ],
          reflection: "ร่างกายและจิตใจส่งสัญญาณว่าต้องการการพักผ่อนอย่างเงียบสงบ"
        }
      };
    }

    // 3. Lack of focus / Brain fog / Study (สมาธิ และ ความฟุ้งซ่าน)
    if (input.includes("สมาธิ") || input.includes("ฟุ้งซ่าน") || input.includes("อ่านหนังสือ") || input.includes("มึน") || input.includes("โฟกัส") || input.includes("สมองล้า") ||
        input.includes("focus") || input.includes("brain fog") || input.includes("study") || input.includes("distracted") || input.includes("confused") || input.includes("mind wandering")) {
      return {
        colorHex: "#ff8f00", // 590nm Amber Orange
        colorReason: "แสงอุ่นความยาวคลื่น 590 นาโนเมตร ให้ความรู้สึกอบอุ่น สดใส นุ่มนวล ช่วยประคองสมาธิในการทำงานและเรียนรู้โดยไม่ทำให้ล้าสายตา",
        techniqueName: "ฝึกสมาธิควบคุมจังหวะ (Box Breathing 4-4-4-4)",
        tagline: "จังหวะฝึกสติสี่ขั้นตอน ช่วยรวมศูนย์ความคิดและปรับความพร้อมในการจดจ่อ",
        phases: [
          { label: "หายใจเข้า (ตั้งสติ)", duration: 4, type: "in" },
          { label: "กลั้นนิ่ง (สร้างสมาธิ)", duration: 4, type: "hold" },
          { label: "หายใจออก (นิ่งสงบ)", duration: 4, type: "out" },
          { label: "กลั้นว่าง (รับรู้สภาวะ)", duration: 4, type: "hold" }
        ],
        affirmation: "สติอยู่กับลมหายใจในปัจจุบัน ความคิดฟุ้งซ่านถูกปล่อยวาง มีพลังและความมุ่งมั่นในการเรียนรู้",
        emotionProfile: {
          category: "focus",
          primary: { label: "ฟุ้งซ่าน", labelEn: "Distracted", intensity: 7 },
          secondary: [
            { label: "สมาธิสั้นลง", labelEn: "Brain Fog", intensity: 6 },
            { label: "สับสน", labelEn: "Confused", intensity: 5 }
          ],
          reflection: "ความคิดกำลังกระจายตัวและต้องการจังหวะในการกลับมารวมศูนย์"
        }
      };
    }

    // 4. Low energy / Sluggishness / Morning (ความเฉื่อยชา และ ต้องการความสดชื่น)
    if (input.includes("ง่วง") || input.includes("ขี้เกียจ") || input.includes("เฉื่อย") || input.includes("ซึม") || input.includes("ยามเช้า") || input.includes("ไม่สดชื่น") ||
        input.includes("tired") || input.includes("morning") || input.includes("sluggish") || input.includes("lazy") || input.includes("low energy") || input.includes("dull")) {
      return {
        colorHex: "#42a5f5", // 460nm Blue
        colorReason: "แสงสีฟ้าความยาวคลื่น 460 นาโนเมตร ช่วยสร้างความรู้สึกสดชื่น โปร่งสบาย ให้บรรยากาศยามเช้าที่ช่วยปลุกความตื่นตัวทางอารมณ์",
        techniqueName: "เติมความสดชื่นทางร่างกาย (Energizing 5-0-5-0)",
        tagline: "เพิ่มการรับอ็อกซิเจนด้วยจังหวะหายใจเข้า-ออกเต็มกำลังเพื่อความสดชื่น",
        phases: [
          { label: "หายใจเข้าลึกเต็มปอด", duration: 5, type: "in" },
          { label: "หายใจออกผ่อนคลายยาว", duration: 5, type: "out" }
        ],
        affirmation: "ความสดชื่นหมุนเวียนเข้าสู่ร่างกาย ร่างกายตื่นตัว มีพลังและความมีชีวิตชีวาพร้อมสำหรับวันใหม่",
        emotionProfile: {
          category: "energy",
          primary: { label: "เฉื่อยชา", labelEn: "Sluggish", intensity: 6 },
          secondary: [
            { label: "ขาดพลังงาน", labelEn: "Low Energy", intensity: 7 },
            { label: "ซึมง่วง", labelEn: "Drowsy", intensity: 5 }
          ],
          reflection: "สภาวะอารมณ์ต้องการแรงกระตุ้นเบาๆ เพื่อคืนความสดชื่นผ่อนคลาย"
        }
      };
    }

    // 5. Anger / Irritation (ความหงุดหงิด และ อารมณ์ร้อน)
    if (input.includes("โกรธ") || input.includes("หงุดหงิด") || input.includes("โมโห") || input.includes("อารมณ์เสีย") || input.includes("ใจร้อน") ||
        input.includes("angry") || input.includes("irritated") || input.includes("mad") || input.includes("frustrated") || input.includes("annoyed")) {
      return {
        colorHex: "#66bb6a", // 525nm Green
        colorReason: "ความยาวคลื่นสีเขียว 525 นาโนเมตร ช่วยให้ความรู้สึกเย็นสบาย ปรับบรรยากาศทางอารมณ์ให้สงบและลดความรู้สึกตึงเครียด",
        techniqueName: "ปรับอารมณ์ให้เย็นสงบ (Cooling Harmony 4-4-6-0)",
        tagline: "ผ่อนคลายความตึงเครียดทางอารมณ์ด้วยลมหายใจออกที่ยาวขึ้น",
        phases: [
          { label: "หายใจเข้าอย่างผ่อนคลาย", duration: 4, type: "in" },
          { label: "กลั้นพักสติ", duration: 4, type: "hold" },
          { label: "หายใจออกช้าๆ ปล่อยความโกรธ", duration: 6, type: "out" }
        ],
        affirmation: "อารมณ์ที่ขุ่นมัวค่อยๆ สงบลง ยอมรับความรู้สึกด้วยความเข้าใจ และผ่อนคลายความตึงเครียดในใจ",
        emotionProfile: {
          category: "anger",
          primary: { label: "หงุดหงิด", labelEn: "Frustrated", intensity: 8 },
          secondary: [
            { label: "ตึงเครียดฉับพลัน", labelEn: "Tense", intensity: 7 },
            { label: "ไม่สบอารมณ์", labelEn: "Annoyed", intensity: 6 }
          ],
          reflection: "มีความรู้สึกแรงต้านหรือความขัดเคืองที่ต้องการพื้นที่ในการปรับให้เย็นลง"
        }
      };
    }

    // 6. Sadness / Grief / Overwhelmed (ความเศร้า และ ความท้อแท้)
    if (input.includes("เศร้า") || input.includes("เสียใจ") || input.includes("ท้อ") || input.includes("ดิ่ง") || input.includes("เหงา") ||
        input.includes("sad") || input.includes("depressed") || input.includes("lonely") || input.includes("down") || input.includes("overwhelmed")) {
      return {
        colorHex: "#ab47bc", // 400nm Violet
        colorReason: "ความยาวคลื่นสีม่วงอบอุ่นช่วยให้ความรู้สึกปลอดภัย ปลอบประโลมจิตใจ และสร้างพื้นที่ทางอารมณ์ที่สงบอ่อนโยน",
        techniqueName: "ปลอบประโลมจิตใจอ่อนโยน (Gentle Heart 4-4-4-0)",
        tagline: "โอบรับความรู้สึกด้วยความเข้าใจ เติมความอบอุ่นและผ่อนคลายจิตใจ",
        phases: [
          { label: "หายใจเข้าโอบรับตนเอง", duration: 4, type: "in" },
          { label: "กลั้นรับรู้ความรู้สึก", duration: 4, type: "hold" },
          { label: "หายใจออกผ่อนคลายใจ", duration: 4, type: "out" }
        ],
        affirmation: "อนุญาตให้ตัวเองรู้สึกและพักผ่อน ทุกอารมณ์ที่เกิดขึ้นได้รับการรับฟังด้วยความเมตตาและอบอุ่น",
        emotionProfile: {
          category: "sadness",
          primary: { label: "เศร้าซึม", labelEn: "Sad", intensity: 7 },
          secondary: [
            { label: "ท้อแท้", labelEn: "Overwhelmed", intensity: 6 },
            { label: "อ้างว้าง", labelEn: "Lonely", intensity: 5 }
          ],
          reflection: "มีความรู้สึกเปราะบางในใจที่ต้องการการโอบรับและปลอบประโลมอย่างนุ่มนวล"
        }
      };
    }

    // 7. Default Fallback: Forest Green Calm (สภาวะผ่อนคลายทั่วไป)
    return {
      colorHex: "#66bb6a", // 525nm Green
      colorReason: "คลื่นแสงสีเขียวความถี่ 525 นาโนเมตร มอบความสบายและผ่อนคลายตามธรรมชาติ ช่วยสร้างความรู้สึกสดชื่นทางร่างกาย",
      techniqueName: "ปรับสมดุลสภาวะผ่อนคลายทั่วไป (Standard Deep Calm)",
      tagline: "ปรับจังหวะลมหายใจเพื่อส่งเสริมสภาวะผ่อนคลายและความสงบภายใน",
      phases: [
        { label: "หายใจเข้าอย่างผ่อนคลาย", duration: 4, type: "in" },
        { label: "กลั้นประคองใจ", duration: 2, type: "hold" },
        { label: "หายใจออกแผ่วเบา", duration: 4, type: "out" },
        { label: "กลั้นรับรู้ภายใน", duration: 2, type: "hold" }
      ],
      affirmation: "ปรับจังหวะชีวิตให้ช้าลง ปรับสภาวะร่างกายเข้าสู่ความสมดุลและความสุขสงบภายใน",
      emotionProfile: {
        category: "calm",
        primary: { label: "ตึงเครียดเล็กน้อย", labelEn: "Mild Tension", intensity: 5 },
        secondary: [
          { label: "ต้องการความสงบ", labelEn: "Seeking Calm", intensity: 5 }
        ],
        reflection: "สภาวะจิตใจอยู่ในเกณฑ์ทั่วไปและพร้อมรับการปรับสมดุลผ่อนคลาย"
      }
    };
  }
}

// Global Class Alias for Compatibility
window.TextSentimentService = TextSentimentService;
window.GeminiService = TextSentimentService;
