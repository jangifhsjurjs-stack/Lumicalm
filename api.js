// API Client and Offline Clinical Expert Mode Simulator for Lunicalm

const GEMINI_JSON_SCHEMA = {
  type: "OBJECT",
  properties: {
    colorHex: { type: "STRING", description: "CSS Hex color code suitable for the mood, e.g. '#66bb6a' for calm, '#42a5f5' for energy, '#ab47bc' for deep sleep, etc." },
    colorReason: { type: "STRING", description: "Neurological explanation of why this color CCT wavelength helps. Write in Thai." },
    techniqueName: { type: "STRING", description: "Name of the customized breathing technique, e.g., 'บำบัดเครียดเร่งด่วน', 'ผ่อนคลายลึกก่อนนอน'" },
    tagline: { type: "STRING", description: "Catchy medical-scientific slogan for this therapy profile" },
    phases: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING", description: "Instruction label, e.g. 'หายใจเข้า', 'กลั้นหายใจ', 'หายใจออก'" },
          duration: { type: "INTEGER", description: "Duration in seconds (typically between 2 and 8)" },
          type: { type: "STRING", enum: ["in", "hold", "out"], description: "Type of breathing phase: 'in' = inhale, 'hold' = hold, 'out' = exhale" }
        },
        required: ["label", "duration", "type"]
      }
    },
    affirmation: { type: "STRING", description: "A positive psychological clinical affirmation for this mental state. Write in Thai." },
    infographic: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "Infographic title, e.g. 'ประมาณการดัชนีประสาทสรีรวิทยา'" },
        cortisolLabel: { type: "STRING", description: "Cortisol stress level indicator label, e.g., 'ระดับคอร์ติซอลลดลง'" },
        cortisolBarPercent: { type: "INTEGER", description: "Percentage value for cortisol bar (0 to 100). Stress should reduce this." },
        vagalLabel: { type: "STRING", description: "Vagal nerve tone activity level label, e.g., 'โทนประสาทเวกัสเพิ่มขึ้น'" },
        vagalBarPercent: { type: "INTEGER", description: "Percentage value for Vagal tone bar (0 to 100). Relaxation should increase this." },
        hrLabel: { type: "STRING", description: "Heart rate change indicator label, e.g., 'อัตราหัวใจเต้นช้าลง (บีพีเอ็ม)'" },
        hrBarPercent: { type: "INTEGER", description: "Percentage value for Heart Rate (typically 50-90 bpm representation)" },
        shiftLabel: { type: "STRING", description: "Overall clinical shift description, e.g., 'ฟื้นฟูสภาวะสมดุล Parasympathetic'" },
        recommendedTime: { type: "STRING", description: "Recommended training session length, e.g., '5-10 นาที'" },
        timeIcon: { type: "STRING", description: "Recommended icon type, e.g. 'clock' or 'moon'" }
      },
      required: ["title", "cortisolLabel", "cortisolBarPercent", "vagalLabel", "vagalBarPercent", "hrLabel", "hrBarPercent", "shiftLabel", "recommendedTime", "timeIcon"]
    }
  },
  required: ["colorHex", "colorReason", "techniqueName", "tagline", "phases", "affirmation", "infographic"]
};

// System instruction to guide the clinical therapist
const SYSTEM_INSTRUCTION = `You are a clinical neuro-therapist expert specializing in chromotherapy (color therapy CCT light cycles) and breathing physiology.
Analyze the user's emotional and stress inputs.
Synthesize a personalized therapy profile in JSON conforming strictly to the requested schema.
Rules for outputs:
- colorHex: Pick colors that correspond to physical wavelengths: 460nm sky blue (#42a5f5) for sluggishness/morning wakefulness; 525nm green (#66bb6a) for high stress/anger; 590nm sunset amber (#ff8f00) for lack of focus/brain fog; 400nm amethyst violet (#ab47bc) for deep anxiety or insomnia. You can also customize hex codes slightly to fit.
- phases: Create structured breathing intervals (e.g. Inhale -> Hold -> Exhale or Box breathing 4-4-4-4) tailored to the situation. Make sure durations are integers.
- Write colorReason, techniqueName, tagline, affirmation, and infographic labels in fluent, supportive, and clinical-grade Thai language.`;

class GeminiService {
  constructor() {
    this.apiKey = "";
    this.modelName = "gemini-2.5-flash"; // default fallback model
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  // Request analysis from Gemini API
  async generateTherapyProfile(userInput) {
    if (!this.apiKey) {
      console.warn("Gemini API Key missing. Switching to Offline Clinical Simulator.");
      return this.runOfflineSimulator(userInput);
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;
    
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `วิเคราะห์อาการ/ความรู้สึกล่าสุดและจัดสูตรบำบัด: "${userInput}"`
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: SYSTEM_INSTRUCTION
          }
        ]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_JSON_SCHEMA
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        const textResponse = data.candidates[0].content.parts[0].text;
        const profile = JSON.parse(textResponse);
        return {
          profile,
          mode: 'online'
        };
      } else {
        throw new Error("Invalid response format from Gemini API");
      }
    } catch (error) {
      console.error("Gemini API request failed:", error);
      return {
        profile: this.runOfflineSimulator(userInput),
        mode: 'simulated',
        error: error.message
      };
    }
  }

  // Offline Clinical Expert Mode Simulator
  runOfflineSimulator(userInput) {
    console.log("Running Offline Clinical Expert Simulator...");
    const input = (userInput || "").toLowerCase();

    // 1. Stress / Anxiety
    if (input.includes("เครียด") || input.includes("กังวล") || input.includes("ตื่นเต้น") || 
        input.includes("stress") || input.includes("anxious") || input.includes("panic") || input.includes("fear")) {
      return {
        colorHex: "#66bb6a", // 525nm Green
        colorReason: "ความยาวคลื่น 525 นาโนเมตร (สีเขียวสว่าง) กระตุ้นการหลั่งสารสื่อประสาทผ่อนคลายและลดระดับการกระตุ้นของต่อมหมวกไต ช่วยบรรเทาความดันและลดอัตราเต้นหัวใจ",
        techniqueName: "คลินิกผ่อนคลายเครียดสะสม (4-7-8 Relaxing)",
        tagline: "คลื่นบำบัดระบบประสาทอัตโนมัติซิมพาเทติกเพื่อความสงบทางอารมณ์ฉับพลัน",
        phases: [
          { label: "หายใจเข้า (กระตุ้น)", duration: 4, type: "in" },
          { label: "กลั้นหายใจ (จัดระบบ)", duration: 7, type: "hold" },
          { label: "หายใจออก (ระบายความเครียด)", duration: 8, type: "out" }
        ],
        affirmation: "ความเครียดในร่างกายกำลังได้รับการผ่อนปรน ค่อยๆ ยอมรับสภาวะปัจจุบัน ปล่อยใจให้สบายและเบาลง",
        infographic: {
          title: "การประมาณค่าสรีรวิทยาคลินิก (จำลอง)",
          cortisolLabel: "ระดับฮอร์โมนคอร์ติซอล (Cortisol)",
          cortisolBarPercent: 35, // Low
          vagalLabel: "โทนประสาทเวกัส (Vagal Nerve Tone)",
          vagalBarPercent: 85, // High
          hrLabel: "อัตราหัวใจเต้นเฉลี่ย (Heart Rate)",
          hrBarPercent: 64, // Normalized
          shiftLabel: "เหนี่ยวนำระบบประสาทผ่อนคลาย (Parasympathetic Integration)",
          recommendedTime: "10 นาที",
          timeIcon: "clock"
        }
      };
    }

    // 2. Insomnia / Exhaustion / Deep sleep request
    if (input.includes("นอนไม่หลับ") || input.includes("เหนื่อย") || input.includes("เพลีย") || 
        input.includes("sleep") || input.includes("insomnia") || input.includes("exhausted") || input.includes("tired")) {
      return {
        colorHex: "#ab47bc", // 400nm Violet
        colorReason: "ความยาวคลื่นสั้น 400 นาโนเมตร (สีม่วงอะเมทิสต์) ช่วยปรับความถี่คลื่นสมองลงสู่คลื่นเทต้า (Theta Wave) ได้ง่ายขึ้น เหมาะสำหรับลดการคิดวนและการจัดกระบวนการทำงานก่อนนอน",
        techniqueName: "บำบัดภวังค์หลับลึก (Deep Calm 4-2-4-2)",
        tagline: "ฟื้นฟูวัฏจักรเวลานอน สลายความวิตกกังวลสะสมด้วยคลื่นแสงพลังสงบ",
        phases: [
          { label: "หายใจเข้าช้าๆ", duration: 4, type: "in" },
          { label: "กลั้นพักจิต", duration: 2, type: "hold" },
          { label: "หายใจออกผ่อนคลาย", duration: 4, type: "out" },
          { label: "กลั้นพักนิ่ง", duration: 2, type: "hold" }
        ],
        affirmation: "ละทิ้งเรื่องราวทั้งหมดของวัน คืนความสงบตามธรรมชาติสู่จิตใจ ร่างกายของฉันพร้อมสำหรับการพักผ่อนอย่างแท้จริง",
        infographic: {
          title: "การประมาณค่าสรีรวิทยาคลินิก (จำลอง)",
          cortisolLabel: "ระดับคอร์ติซอล (Cortisol)",
          cortisolBarPercent: 20, // Very Low
          vagalLabel: "โทนประสาทเวกัส (Vagal Nerve Tone)",
          vagalBarPercent: 95, // Near max
          hrLabel: "อัตราหัวใจเต้นเฉลี่ย (Heart Rate)",
          hrBarPercent: 58, // Sleeping rhythm
          shiftLabel: "กระตุ้นวงจรหลับลึกแบบไร้คลื่นรบกวน (Zen Cosmic State)",
          recommendedTime: "15 นาที",
          timeIcon: "moon"
        }
      };
    }

    // 3. Lack of focus / Brain fog
    if (input.includes("สมาธิ") || input.includes("ฟุ้งซ่าน") || input.includes("อ่านหนังสือ") || 
        input.includes("focus") || input.includes("brain fog") || input.includes("study") || input.includes("distracted")) {
      return {
        colorHex: "#ff8f00", // 590nm Amber Orange
        colorReason: "แสงอุ่นความยาวคลื่น 590 นาโนเมตร กระตุ้นการผลิตฮอร์โมนโดปามีนและการทําหน้าที่ระดับสูงของสมอง (Cognitive Functions) เพิ่มระดับการจดจ่อโดยไม่ทำให้ล้าสายตา",
        techniqueName: "ฝึกกล่องสยบความฟุ้งซ่าน (Box Breathing 4-4-4-4)",
        tagline: "เทคนิคการตั้งสติควบคุมแรงกดดันและความตื่นตระหนกแบบหน่วยซีล",
        phases: [
          { label: "หายใจเข้า (โฟกัส)", duration: 4, type: "in" },
          { label: "กลั้นนิ่ง (สมาธิ)", duration: 4, type: "hold" },
          { label: "หายใจออก (นิ่งสงบ)", duration: 4, type: "out" },
          { label: "กลั้นว่าง (ระวังรับรู้)", duration: 4, type: "hold" }
        ],
        affirmation: "สติของฉันอยู่ที่วินาทีนี้ ความคิดฟุ้งซ่านถูกปล่อยวาง ฉันมีพลังและความมุ่งมั่นในการเรียนรู้",
        infographic: {
          title: "การประมาณค่าสรีรวิทยาคลินิก (จำลอง)",
          cortisolLabel: "ระดับคอร์ติซอล (Cortisol)",
          cortisolBarPercent: 48, // Balanced
          vagalLabel: "โทนประสาทเวกัส (Vagal Nerve Tone)",
          vagalBarPercent: 70, // Balanced
          hrLabel: "อัตราหัวใจเต้นเฉลี่ย (Heart Rate)",
          hrBarPercent: 72, // Active focus
          shiftLabel: "กระตุ้นคลื่นสมองเบต้าและประสิทธิภาพระดับการตัดสินใจ (Beta Wave Active Focus)",
          recommendedTime: "5 นาที",
          timeIcon: "clock"
        }
      };
    }

    // 4. Low energy / Morning sluggishness
    if (input.includes("ง่วง") || input.includes("ขี้เกียจ") || input.includes("เฉื่อย") || 
        input.includes("tired") || input.includes("morning") || input.includes("sluggish") || input.includes("lazy")) {
      return {
        colorHex: "#42a5f5", // 460nm Blue
        colorReason: "ความยาวคลื่น 460 นาโนเมตร (แสงฟ้าสด) กระตุ้นตัวรับแสงเมลาโนปซิน (Melanopsin) ในดวงตาโดยตรง ช่วยกดการหลั่งฮอร์โมนเมลาโทนินและปลุกร่างกายให้ตื่นตัวทันที",
        techniqueName: "กระตุ้นอ็อกซิเจนเร่งด่วน (Energizing 5-0-5-0)",
        tagline: "คลื่นกระตุ้นระบบหมุนเวียนโลหิตและเพิ่มระดับพลังงานสมองยามเช้า",
        phases: [
          { label: "หายใจเข้าแรงลึก", duration: 5, type: "in" },
          { label: "หายใจออกเต็มกำลัง", duration: 5, type: "out" }
        ],
        affirmation: "พลังแห่งความมีชีวิตชีวาไหลเวียนเข้าสู่เซลล์ทุกส่วน ร่างกายของฉันตื่นตัวและพร้อมสําหรับวันใหม่ที่ยอดเยี่ยม",
        infographic: {
          title: "การประมาณค่าสรีรวิทยาคลินิก (จำลอง)",
          cortisolLabel: "ระดับคอร์ติซอล (Cortisol)",
          cortisolBarPercent: 65, // Active cortisol wakeups
          vagalLabel: "โทนประสาทเวกัส (Vagal Nerve Tone)",
          vagalBarPercent: 60,
          hrLabel: "อัตราหัวใจเต้นเฉลี่ย (Heart Rate)",
          hrBarPercent: 82, // Energized pulse
          shiftLabel: "กระตุ้นระบบตื่นตัวและฟื้นฟูวัฏจักรการนอนตื่น (Melatonin Suppression Wave)",
          recommendedTime: "5-7 นาที",
          timeIcon: "clock"
        }
      };
    }

    // Default Fallback: Forest Green Calm
    return {
      colorHex: "#66bb6a", // 525nm Green
      colorReason: "ใช้สูตรมาตรฐานสีเขียวคลื่นความถี่ 525 นาโนเมตร เพื่อรักษาความสมดุลและความดันเลือดให้อยู่ในเกณฑ์ผ่อนคลายและสร้างความรู้สึกสดชื่นทางร่างกาย",
      techniqueName: "ปรับสมดุลสภาวะหัวใจและหลอดเลือด (Standard Deep Calm)",
      tagline: "ปรับปรุงอัตราการแปรผันการเต้นของหัวใจ (HRV) และระบบไหลเวียน",
      phases: [
        { label: "หายใจเข้าอย่างผ่อนคลาย", duration: 4, type: "in" },
        { label: "กลั้นประคองใจ", duration: 2, type: "hold" },
        { label: "หายใจออกแผ่วเบา", duration: 4, type: "out" },
        { label: "กลั้นรับรู้ภายใน", duration: 2, type: "hold" }
      ],
      affirmation: "ปล่อยจังหวะชีวิตให้ช้าลง ปรับจังหวะสรีรวิทยาเข้าสู่ความสว่างไสวและความมีสุขสงบภายใน",
      infographic: {
        title: "การประมาณค่าสรีรวิทยาคลินิก (จำลอง)",
        cortisolLabel: "ระดับคอร์ติซอล (Cortisol)",
        cortisolBarPercent: 40,
        vagalLabel: "โทนประสาทเวกัส (Vagal Nerve Tone)",
        vagalBarPercent: 78,
        hrLabel: "อัตราหัวใจเต้นเฉลี่ย (Heart Rate)",
        hrBarPercent: 68,
        shiftLabel: "จัดระเบียบสรีระประสานสอดคล้อง (Physiological Coherence)",
        recommendedTime: "8 นาที",
        timeIcon: "clock"
      }
    };
  }
}
