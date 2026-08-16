import { Link } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import ContentPage from '../../components/layout/ContentPage'
import PayIdDepositPanel from '../../components/booking/PayIdDepositPanel'
import BiDisplayHeading from '../../components/ui/BiDisplayHeading'
import BiText from '../../components/ui/BiText'
import { FACEBOOK_MESSENGER_URL, FACEBOOK_PAGE_URL } from '../../data/contactChannels'
import { CANCELLATION_POLICY } from '../../data/risks'
import { useState } from 'react'

export function TermsPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'ข้อกำหนดและเงื่อนไข' : 'Terms & Conditions'}
      subtitle={
        lang === 'th'
          ? 'เงื่อนไขการใช้เว็บไซต์และการจองทริป Trip2Talk — รายละเอียดเพิ่มอยู่ใน waiver ก่อนจอง'
          : 'Website and booking terms for Trip2Talk. Full trip acknowledgements also appear in the digital waiver before booking.'
      }
    >
      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">1. Booking & payment</h2>
        <p>
          By using trip2talk.com.au and related booking tools you agree to provide accurate contact
          details, pay the required deposit to secure a seat, and complete the balance with our team
          before departure (PayID / agreed installments). Seats are not confirmed until deposit is
          received and acknowledged by Trip2Talk staff.
        </p>
        <p className="font-thai text-ink-soft">
          การจองถือว่าคุณยืนยันข้อมูลติดต่อถูกต้อง ชำระมัดจำเพื่อล็อคที่นั่ง และชำระส่วนที่เหลือกับทีมก่อนวันเดินทาง
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">2. Trip participation & waiver</h2>
        <p>
          Guests must complete the digital waiver (liability release, OSHC acknowledgment for student
          visa holders where applicable, medical emergency authorization, and photo/video consent)
          before booking. Force majeure and aurora-viewing trips have additional disclaimers shown in
          the waiver.
        </p>
        <p className="font-thai text-ink-soft">
          ผู้เดินทางต้องลงนาม waiver อิเล็กทรอนิกส์ก่อนจอง รวมถึงการสละสิทธิ์ความรับผิด การยืนยัน OSHC (ถ้าใช้วีซ่านักเรียน)
          การอนุญาตรักษาฉุกเฉิน และความยินยอมใช้รูป/วิดีโอ
        </p>
        <Link to="/waiver" className="inline-block text-teal-700 underline">
          {lang === 'th' ? 'อ่าน waiver / เงื่อนไขทริป →' : 'Read the trip waiver →'}
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">3. Cancellation</h2>
        <p>
          Cancellation outcomes depend on how many days before departure you cancel. See our
          cancellation policy for deposit/credit rules.
        </p>
        <Link to="/cancellation" className="inline-block text-teal-700 underline">
          {lang === 'th' ? 'นโยบายยกเลิก →' : 'Cancellation policy →'}
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">4. Photos & content</h2>
        <p>
          Photos and trip content are owned by Trip2Talk and our photographers unless otherwise
          agreed in writing. Do not republish trip materials for commercial use without permission.
        </p>
        <p className="font-thai text-ink-soft">
          รูปและคอนเทนต์ทริปเป็นของ Trip2Talk และช่างภาพ ห้ามนำไปใช้เชิงพาณิชย์โดยไม่ได้รับอนุญาต
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">5. Operator</h2>
        <p>
          Services are provided by Chapter99 trading as Trip2Talk (Saard Saenmuang), ABN 81 951 461
          769, Sydney NSW, Australia. Contact:{' '}
          <a href="mailto:trip2talksyd@gmail.com" className="text-teal-700 underline">
            trip2talksyd@gmail.com
          </a>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg text-ink">6. Trip duration & extensions</h2>
        <p className="font-thai text-ink-soft">6. ระยะเวลาทริปและการขยายทริป</p>
        <p>
          <b>Package Duration is Final Price</b> — the listed price covers only the stated number of
          days. Requesting extra days or a different route is treated as a brand-new custom quote, not
          an extension of the existing package.
        </p>
        <p className="font-thai text-ink-soft">
          <b>ราคาแพ็กเกจครอบคลุมเฉพาะจำนวนวันที่ระบุ</b> — ราคาที่ระบุครอบคลุมเฉพาะจำนวนวันที่ระบุในแพ็กเกจเท่านั้น
          การขอเพิ่มวันหรือเปลี่ยนเส้นทางถือเป็นการขอใบเสนอราคาใหม่แบบกำหนดเอง ไม่ถือเป็นการขยายแพ็กเกจเดิม
        </p>
        <p>
          <b>Extra Day Confirmation Terms</b> — our team will provide a written price quote for the
          difference. Full payment must be received at least 10 days before departure. If not paid by
          the deadline, the trip proceeds on the originally booked days only — no on-site negotiation.
        </p>
        <p className="font-thai text-ink-soft">
          <b>เงื่อนไขการยืนยันวันเพิ่ม</b> — ทีมงานจะออกใบเสนอราคาเป็นลายลักษณ์อักษรสำหรับส่วนต่าง
          ต้องชำระเต็มจำนวนอย่างน้อย 10 วันก่อนวันเดินทาง หากไม่ชำระภายในกำหนด ทริปจะดำเนินตามจำนวนวันเดิมที่จองไว้เท่านั้น
          — ไม่มีการต่อรองหน้างาน
        </p>
        <p>
          <b>No On-Trip Extensions</b> — due to staff commitments to subsequent trips, extending the
          trip or adding days mid-trip is not possible under any circumstances, regardless of
          willingness to pay extra.
        </p>
        <p className="font-thai text-ink-soft">
          <b>ห้ามขยายทริประหว่างเดินทาง</b> — เนื่องจากทีมงานมีภาระผูกพันกับทริปถัดไป
          จึงไม่สามารถขยายทริปหรือเพิ่มวันระหว่างเดินทางได้ในทุกกรณี แม้ยินดีจ่ายเพิ่มก็ตาม
        </p>
      </section>

      <p className="rounded-xl border border-amber-500/40 bg-amber-50 px-3 py-2 text-[11px] text-ink-soft">
        Draft for business review — not legal advice. Have an Australian legal professional review
        before treating as final.
        <span className="mt-1 block font-thai">
          ฉบับร่างสำหรับเจ้าของธุรกิจตรวจ — ไม่ใช่คำแนะนำทางกฎหมาย ควรให้ผู้เชี่ยวชาญตรวจก่อนใช้จริง
        </span>
      </p>
    </ContentPage>
  )
}

function PolicyHeading({ en, th }: { en: string; th: string }) {
  return (
    <BiDisplayHeading
      as="h2"
      en={en}
      th={th}
      className="mb-2"
      enClassName="text-lg font-semibold text-ink"
      thClassName="mt-0.5 text-[13px] font-medium text-ink-soft"
    />
  )
}

export function PrivacyPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'นโยบายความเป็นส่วนตัว' : 'Privacy Policy'}
      subtitle={
        lang === 'th'
          ? 'ข้อมูลที่เราเก็บ เก็บอย่างไร และใช้ทำอะไร — ฉบับร่างรอตรวจ'
          : 'What we collect, where it is stored, and how we use it — draft pending review.'
      }
    >
      <p className="rounded-xl border border-amber-500/40 bg-amber-50 px-3 py-2 text-[11px] text-ink-soft">
        <strong>Draft — not a final published policy.</strong> Owner and (if you choose) an Australian
        privacy lawyer should review before this is treated as live.
        <span className="mt-1 block font-thai">
          <strong>ฉบับร่าง — ยังไม่ใช่นโยบายที่ประกาศใช้จริง</strong> ควรให้เจ้าของธุรกิจ
          และที่ปรึกษากฎหมายตรวจก่อนถือว่าเป็นฉบับสมบูรณ์
        </span>
      </p>

      <section>
        <PolicyHeading en="1. Who we are" th="1. เราคือใคร" />
        <BiText
          as="p"
          en="Trip2Talk is operated by Chapter99 trading as Trip2Talk (Saard Saenmuang), ABN 81 951 461 769, based in Sydney, Australia. Website: trip2talk.com.au. Email: trip2talksyd@gmail.com."
          th="Trip2Talk ดำเนินการโดย Chapter99 ในนาม Trip2Talk (Saard Saenmuang) ABN 81 951 461 769 สำนักงานซิดนีย์ ออสเตรเลีย เว็บไซต์ trip2talk.com.au อีเมล trip2talksyd@gmail.com"
        />
      </section>

      <section>
        <PolicyHeading en="2. What we collect" th="2. ข้อมูลที่เราเก็บ" />
        <BiText
          as="p"
          en="When you book a trip we collect the details you enter on the booking and waiver forms. In the current product that includes:"
          th="เมื่อจองทริป เราเก็บข้อมูลที่คุณกรอกในแบบฟอร์มจองและ waiver ตามระบบปัจจุบัน ได้แก่:"
        />
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <BiText
              en="Identity and contact: first and last name, email, phone, date of birth, and passport number if you provide it (the form may store “PENDING” if left blank)."
              th="ชื่อ-นามสกุล อีเมล เบอร์โทร วันเกิด และเลขหนังสือเดินทางหากกรอก (ถ้าว่าง ระบบอาจบันทึกเป็น PENDING)"
            />
          </li>
          <li>
            <BiText
              en="Trip booking: trip code, travel date, number of seats, booking reference, and how you found us."
              th="ข้อมูลทริป รหัสทริป วันเดินทาง จำนวนที่นั่ง เลขที่การจอง และช่องทางที่รู้จักเรา"
            />
          </li>
          <li>
            <BiText
              en="Safety information: emergency contact name and phone (required), medical conditions, allergies, dietary notes, and insurance / OSHC details you enter."
              th="ข้อมูลความปลอดภัย: ชื่อและเบอร์ผู้ติดต่อฉุกเฉิน (จำเป็น) โรคประจำตัว ภูมิแพ้ ข้อจำกัดอาหาร และข้อมูลประกัน / OSHC ที่คุณกรอก"
            />
          </li>
          <li>
            <BiText
              en="Optional flight-assist fields if you ask us to help book flights: legal name, date of birth, passport number, nationality, and frequent-flyer number."
              th="ข้อมูลช่วยจองตั๋วบิน (เมื่อคุณเปิดใช้): ชื่อตามพาสปอร์ต วันเกิด เลขหนังสือเดินทาง สัญชาติ และเลขสมาชิกสายการบิน"
            />
          </li>
          <li>
            <BiText
              en="Waiver records stored against the booking: typed digital signature, timestamp, accepted clause IDs, and (if staff assist) an authorization note."
              th="บันทึก waiver ผูกกับการจอง: ลายเซ็นดิจิทัล เวลาที่ลงนาม ข้อที่ยินยอม และบันทึกการลงนามแทนโดยพนักงาน (ถ้ามี)"
            />
          </li>
          <li>
            <BiText
              en="Payment records: amount, method (PayID, Square card, Afterpay, cash, or bank transfer), dates, invoice numbers, Square payment IDs, and PayID slip images if you upload them. We do not store full card numbers, CVV, or card PINs — Square processes the card or Afterpay charge."
              th="ประวัติการชำระ: ยอด ช่องทาง (PayID, บัตร Square, Afterpay, เงินสด หรือโอนธนาคาร) วันที่ เลขใบเสร็จ รหัสชำระ Square และสลิป PayID หากอัปโหลด เราไม่เก็บเลขบัตรเต็ม CVV หรือ PIN ของบัตร — Square เป็นผู้ประมวลผลบัตร/Afterpay"
            />
          </li>
          <li>
            <BiText
              en="Waitlist name, phone, and email if a trip is full and you join the waitlist."
              th="ชื่อ เบอร์ และอีเมลใน waitlist หากทริปเต็ม"
            />
          </li>
        </ul>
      </section>

      <section>
        <PolicyHeading en="3. How we use it" th="3. เราใช้ข้อมูลอย่างไร" />
        <BiText
          as="p"
          en="We use this information to hold your seat, take deposits and remaining payments, issue tax invoices, coordinate the trip (usually through our Facebook Page inbox and group chat), share trip-day safety notes with authenticated guides/staff, deliver photo galleries, and run the business. We do not sell your personal information."
          th="ใช้เพื่อล็อคที่นั่ง รับมัดจำและยอดที่เหลือ ออกใบกำกับภาษี ประสานทริป (มักผ่านเพจ Facebook และแชทกลุ่ม) ให้ไกด์/พนักงานที่ล็อกอินดูข้อมูลความปลอดภัยวันทริป ส่งอัลบั้มรูป และดำเนินธุรกิจ เราไม่ขายข้อมูลส่วนบุคคล"
        />
      </section>

      <section>
        <PolicyHeading en="4. Payments" th="4. การชำระเงิน" />
        <BiText
          as="p"
          en="PayID: you transfer to our published PayID and may upload a payment slip. The slip is stored in our private payment-slips storage and opened only by logged-in staff."
          th="PayID: คุณโอนเข้า PayID ที่ประกาศ และอาจอัปโหลดสลิป สลิปเก็บในที่เก็บแบบไม่เปิดสาธารณะ พนักงานที่ล็อกอินเท่านั้นที่เปิดดูได้"
        />
        <BiText
          as="p"
          className="mt-2"
          en="Card and Afterpay: charges run through Square (same merchant account as in-person Square). Square receives the card or Afterpay details. We store the booking method (square or afterpay), amount charged, and Square’s payment reference — not the full PAN."
          th="บัตรและ Afterpay: ชำระผ่าน Square (บัญชีเดียวกับเครื่องรูดหน้าร้าน) Square เป็นผู้รับข้อมูลบัตร/Afterpay เราเก็บช่องทาง (square หรือ afterpay) ยอดที่ตัด และรหัสอ้างอิงของ Square — ไม่เก็บเลขบัตรเต็ม"
        />
      </section>

      <section>
        <PolicyHeading en="5. Staff access" th="5. การเข้าถึงของพนักงาน" />
        <BiText
          as="p"
          en="Public visitors cannot list other people’s bookings. Staff tools at /app require a PIN login that creates a time-limited staff session. Booking, medical, emergency, passport, payment, and waiver records are then loaded through our staff API (not open database access in the browser). Access is limited to staff roles we assign (for example cashier, guide, manager, owner)."
          th="ผู้เข้าชมทั่วไปไม่สามารถดูรายการจองของผู้อื่นได้ เครื่องมือพนักงานที่ /app ต้องล็อกอินด้วย PIN เพื่อสร้างเซสชัน มีกำหนดหมดอายุ ข้อมูลการจอง การแพทย์ ผู้ติดต่อฉุกเฉิน พาสปอร์ต การชำระ และ waiver ถูกโหลดผ่าน staff API ไม่ได้เปิดฐานข้อมูลในเบราว์เซอร์ สิทธิ์จำกัดตามบทบาทที่เรากำหนด เช่น แคชเชียร์ ไกด์ ผู้จัดการ เจ้าของ"
        />
      </section>

      <section>
        <PolicyHeading en="6. Photos and marketing" th="6. รูปภาพและการตลาด" />
        <BiText
          as="p"
          en="Trip photos and video may include guests. Before booking, the digital waiver includes a Photo & Video Consent clause: you consent to Trip2Talk using photos/videos from the trip for marketing unless you opt out in writing before departure. To opt out, email trip2talksyd@gmail.com with your booking reference before the trip starts. Guest galleries are typically sent via Pic-Time. Marketing images may also appear on this website, our Facebook Page, and related Trip2Talk / Chapter99 channels."
          th="รูปและวิดีโอทริปอาจมีภาพผู้ร่วมเดินทาง ก่อนจอง เอกสาร waiver มีข้อยินยอมใช้ภาพ/วิดีโอ: คุณยินยอมให้ Trip2Talk ใช้เพื่อการตลาด เว้นแต่แจ้ง opt-out เป็นลายลักษณ์อักษรก่อนเดินทาง หากไม่ต้องการให้ใช้ภาพ ส่งอีเมลไปที่ trip2talksyd@gmail.com พร้อมเลขที่การจองก่อนวันออกเดินทาง อัลบั้มลูกค้าส่งผ่าน Pic-Time เป็นหลัก ภาพการตลาดอาจปรากฏบนเว็บไซต์นี้ เพจ Facebook และช่องทาง Trip2Talk / Chapter99 ที่เกี่ยวข้อง"
        />
        <p className="mt-2">
          <Link to="/waiver" className="text-teal-700 underline">
            {lang === 'th' ? 'อ่าน waiver →' : 'Read the waiver →'}
          </Link>
        </p>
      </section>

      <section>
        <PolicyHeading en="7. Storage, hosting, and processors" th="7. ที่เก็บข้อมูล ผู้ให้บริการ" />
        <BiText
          as="p"
          en="Booking data is stored in Supabase (PostgreSQL) in the Sydney region (ap-southeast-2), with row-level security. The public site is hosted on Vercel. We also use Square (payments), Pic-Time (guest galleries), Meta/Facebook (inbox and Page coordination), and Google Fonts (website typefaces). Square, Pic-Time, Meta, Vercel, and Google Fonts may process data outside Australia. Those providers handle data under their own terms."
          th="ข้อมูลการจองเก็บใน Supabase (PostgreSQL) โซนซิดนีย์ (ap-southeast-2) พร้อม RLS เว็บโฮสต์บน Vercel นอกจากนี้ใช้ Square (ชำระเงิน) Pic-Time (อัลบั้มลูกค้า) Meta/Facebook (อินบ็อกซ์และเพจ) และ Google Fonts (ฟอนต์เว็บ) Square, Pic-Time, Meta, Vercel และ Google Fonts อาจประมวลผลข้อมูลนอกออสเตรเลีย ผู้ให้บริการเหล่านี้ดำเนินการตามข้อกำหนดของตนเอง"
        />
      </section>

      <section>
        <PolicyHeading en="8. Cookies and analytics" th="8. คุกกี้และการวิเคราะห์" />
        <BiText
          as="p"
          en="This site does not load Google Analytics, Meta Pixel, or other advertising/analytics scripts. We use essential browser storage only: language preference, waiver/confirmation session state, optional notification toggles on this device, a one-time PWA cache-clear flag, and staff session tokens after PIN login. Google Fonts may set cookies according to Google’s policies. If we add analytics later, we will add a consent banner first."
          th="เว็บนี้ไม่ได้โหลด Google Analytics, Meta Pixel หรือสคริปต์โฆษณา/วิเคราะห์อื่น ใช้ที่เก็บในเบราว์เซอร์เท่าที่จำเป็น: ภาษา เซสชัน waiver/ยืนยันการจอง สวิตช์แจ้งเตือนบนเครื่องนี้ ธงล้างแคช PWA ครั้งเดียว และโทเคนพนักงานหลังล็อกอิน PIN Google Fonts อาจตั้งคุกกี้ตามนโยบายของ Google หากเพิ่มระบบวิเคราะห์ในภายหลัง จะมีแบนเนอร์ขอความยินยอมก่อน"
        />
      </section>

      <section>
        <PolicyHeading en="9. How long we keep data" th="9. เก็บข้อมูลนานเท่าใด" />
        <BiText
          as="p"
          en="Financial and core booking records (invoices, payment ledger, booking identity and trip details) are kept for 5 years to meet Australian tax record-keeping. Sensitive safety and insurance fields are cleared automatically every day by a scheduled job, 60 days after the trip end date: medical conditions, allergies, emergency contact name, emergency contact phone, emergency contact relationship, medications, dietary requirements, OSHC provider, OSHC expiry, OSHC membership number, travel insurance provider, and travel insurance policy number. Passport and flight-assist fields are not part of that 60-day wipe; ask us if you want those removed after the trip."
          th="ข้อมูลการเงินและการจองหลัก (ใบเสร็จ สมุดชำระ ตัวตนและรายละเอียดทริป) เก็บ 5 ปีตามหน้าที่ด้านภาษีของออสเตรเลีย ข้อมูลความปลอดภัยและประกันที่อ่อนไหวจะถูกล้างอัตโนมัติทุกวันโดยงานตามตาราง หลังวันสิ้นสุดทริปครบ 60 วัน ได้แก่ โรคประจำตัว ภูมิแพ้ ชื่อผู้ติดต่อฉุกเฉิน เบอร์ผู้ติดต่อฉุกเฉิน ความสัมพันธ์ผู้ติดต่อฉุกเฉิน ยาที่ใช้อยู่ ข้อจำกัดด้านอาหาร ผู้ให้บริการ OSHC วันหมดอายุ OSHC เลขสมาชิก OSHC ผู้ให้บริการประกันเดินทาง และเลขกรมธรรม์ประกันเดินทาง เลขพาสปอร์ตและข้อมูลช่วยจองตั๋วไม่อยู่ในชุดล้าง 60 วันนี้ หากต้องการให้ลบหลังทริป แจ้งเราได้"
        />
      </section>

      <section>
        <PolicyHeading en="10. Your rights" th="10. สิทธิของคุณ" />
        <BiText
          as="p"
          en="You may ask us to access, correct, or delete personal information that is no longer required for the trip, tax, or safety. Use the My Trip lookup with your booking reference and email/phone, or email trip2talksyd@gmail.com. Australian Privacy Principles may apply to this small business — this notice is practical disclosure, not legal advice."
          th="คุณขอเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลที่ไม่จำเป็นต่อทริป ภาษี หรือความปลอดภัยได้แล้ว ใช้หน้า My Trip ด้วยเลขที่การจองและอีเมล/เบอร์ หรืออีเมล trip2talksyd@gmail.com หลักการความเป็นส่วนตัวของออสเตรเลียอาจใช้กับธุรกิจขนาดเล็กนี้ — หน้านี้อธิบายการปฏิบัติจริง ไม่ใช่คำแนะนำทางกฎหมาย"
        />
      </section>

      <BiText
        as="p"
        className="text-[11px] text-ink-soft"
        en="Last updated: 15 August 2026 (draft)."
        th="อัปเดตล่าสุด: 15 สิงหาคม 2026 (ฉบับร่าง)"
      />
    </ContentPage>
  )
}

export function CancellationPage() {
  const { lang } = useLang()
  const policy = CANCELLATION_POLICY[lang]
  return (
    <ContentPage title={policy.title} subtitle={policy.intro}>
      <ul className="space-y-3">
        {policy.rules.map((rule) => (
          <li key={rule.condition} className="rounded-xl border border-line bg-mint-100/50 p-3">
            <p className="font-semibold text-ink">{rule.condition}</p>
            <p className="mt-1 text-ink-soft">{rule.outcome}</p>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}

export function PaymentMethodsPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'วิธีชำระเงิน' : 'Payment Methods'}
      subtitle={
        lang === 'th'
          ? 'มัดจำเพื่อล็อคที่นั่ง — ส่วนที่เหลือผ่อนกับทีมได้'
          : 'We collect a deposit to secure your seat — remaining balance is arranged with our team.'
      }
    >
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/10 p-4">
        <p className="font-semibold text-ink">
          {lang === 'th' ? 'มัดจำที่ต้องจ่ายตอนจอง' : 'Deposit due at booking'}
        </p>
        <p className="mt-1 text-ink-soft">
          {lang === 'th'
            ? 'ปกติ $100 AUD × จำนวนผู้เดินทาง (ตามที่แสดงในหน้าทริป) — แนะนำโอน PayID (ไม่มีค่าธรรมเนียม) หรือจ่ายบัตร/Afterpay ผ่าน Square ในหน้าจอง'
            : 'Typically $100 AUD × travellers (as shown on the trip). PayID is recommended (no fees); card / Afterpay via Square is also available on the booking page.'}
        </p>
      </div>

      <PayIdDepositPanel variant="page" />

      <div className="rounded-xl border border-line bg-card p-4">
        <p className="font-semibold text-ink">
          {lang === 'th' ? 'บัตรเครดิต / Afterpay (Square)' : 'Card / Afterpay (Square)'}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {lang === 'th'
            ? 'เลือก “Pay by card / Afterpay” ในหน้าจองเพื่อเปิดหน้าชำระ Square — มีค่าธรรมเนียมตามบัตร/Afterpay'
            : 'Choose “Pay by card / Afterpay” on the booking form to open Square’s hosted checkout. Card/Afterpay processing fees apply.'}
        </p>
      </div>
      <p>
        We only collect a deposit to secure your seat — the remaining balance is arranged directly
        with our team, in 2–4 flexible installments.
      </p>
      <p className="font-thai text-ink-soft">
        เราเก็บมัดจำเพื่อล็อคที่นั่ง ส่วนที่เหลือคุยกับทีมได้ ผ่อนได้ 2–4 งวดตามความเหมาะสม
      </p>
      <p>
        <strong>{lang === 'th' ? 'ไม่รวมในราคาทริป:' : 'Not included in trip price:'}</strong>{' '}
        flights, meals, and travel insurance unless a trip page says otherwise.
      </p>
      <p>
        Private room upgrades can be arranged for an extra fee — message us on Facebook after your
        deposit.
      </p>
    </ContentPage>
  )
}

type NotifyPrefs = {
  tripReminders: boolean
  promo: boolean
  photoReady: boolean
}

const DEFAULT_NOTIFY_PREFS: NotifyPrefs = {
  tripReminders: true,
  promo: false,
  photoReady: true,
}

function loadNotifyPrefs(): NotifyPrefs {
  try {
    const raw = localStorage.getItem('t2t_notify_prefs')
    if (!raw) return { ...DEFAULT_NOTIFY_PREFS }
    const parsed = JSON.parse(raw) as Partial<NotifyPrefs>
    return { ...DEFAULT_NOTIFY_PREFS, ...parsed }
  } catch {
    return { ...DEFAULT_NOTIFY_PREFS }
  }
}

export function NotificationsPage() {
  const { lang } = useLang()
  const [prefs, setPrefs] = useState<NotifyPrefs>(loadNotifyPrefs)

  function toggle(key: keyof NotifyPrefs) {
    setPrefs((p: NotifyPrefs) => {
      const next = { ...p, [key]: !p[key] }
      try {
        localStorage.setItem('t2t_notify_prefs', JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }

  const rows: { key: keyof NotifyPrefs; en: string; th: string }[] = [
    { key: 'tripReminders', en: 'Trip reminders (departure & meetup)', th: 'แจ้งเตือนวันเดินทางและจุดนัดพบ' },
    { key: 'photoReady', en: 'Photo gallery ready (Pic-Time)', th: 'อัลบั้มภาพพร้อม (Pic-Time)' },
    { key: 'promo', en: 'New trip & promo emails', th: 'อีเมลทริปใหม่และโปรโมชัน' },
  ]

  return (
    <ContentPage
      title={lang === 'th' ? 'การแจ้งเตือน' : 'Notifications'}
      subtitle={
        lang === 'th'
          ? 'ตั้งค่าบนเครื่องนี้ก่อน — ระบบพุชจริงจะต่อภายหลัง'
          : 'Saved on this device for now — real push delivery comes later.'
      }
    >
      <ul className="space-y-2">
        {rows.map((row) => (
          <li
            key={row.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-line bg-cream px-3 py-3"
          >
            <span className="text-sm text-ink">{lang === 'th' ? row.th : row.en}</span>
            <button
              type="button"
              role="switch"
              aria-checked={prefs[row.key]}
              onClick={() => toggle(row.key)}
              className={`relative h-7 w-12 rounded-full transition-colors ${
                prefs[row.key] ? 'bg-teal-600' : 'bg-line'
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-cream shadow transition-transform ${
                  prefs[row.key] ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </li>
        ))}
      </ul>
    </ContentPage>
  )
}

export function HelpSupportPage() {
  const { lang } = useLang()
  const faqs = [
    {
      qEn: 'How do I pay the deposit?',
      qTh: 'จ่ายมัดจำยังไง?',
      aEn: 'Use PayID on the booking page, then upload your slip. We confirm seats after verification.',
      aTh: 'จ่าย PayID ในหน้าจอง แล้วอัปโหลดสลิป เราจะยืนยันที่นั่งหลังตรวจยอด',
    },
    {
      qEn: 'Where is the group chat?',
      qTh: 'แชทกลุ่มอยู่ที่ไหน?',
      aEn: 'After deposit, message our Facebook Page with your booking reference — we set up the group there.',
      aTh: 'หลังมัดจำ ทักเพจ Facebook พร้อมเลขที่การจอง — เราจัดกลุ่มแชทที่นั่น',
    },
    {
      qEn: 'Can I get a private room?',
      qTh: 'ขอห้องส่วนตัวได้ไหม?',
      aEn: 'Yes, on most trips for an extra fee — arrange with us on Facebook before departure.',
      aTh: 'ได้ในเกือบทุกทริป มีค่าใช้จ่ายเพิ่ม — คุยกับเราทาง Facebook ก่อนเดินทาง',
    },
  ]

  return (
    <ContentPage
      title={lang === 'th' ? 'ช่วยเหลือและติดต่อ' : 'Help & Support'}
      subtitle={
        lang === 'th'
          ? 'ทีมซัพพอร์ตจริงผ่าน Facebook Page — ไม่มีแชทในแอป'
          : 'Real support runs through our Facebook Page inbox — not an in-app chat.'
      }
    >
      <div className="flex flex-wrap gap-2">
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-embossed !text-[11px]"
        >
          Facebook Page
        </a>
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line bg-mint-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink"
        >
          Messenger
        </a>
      </div>
      <ul className="mt-4 space-y-3">
        {faqs.map((f) => (
          <li key={f.qEn} className="rounded-xl border border-line bg-cream p-3">
            <p className="font-semibold text-ink">{lang === 'th' ? f.qTh : f.qEn}</p>
            <p className="mt-1 text-ink-soft">{lang === 'th' ? f.aTh : f.aEn}</p>
          </li>
        ))}
      </ul>
      <Link to="/my-trip" className="inline-block text-teal-700 underline">
        {lang === 'th' ? 'ค้นหาสถานะทริปของฉัน →' : 'Look up my trip status →'}
      </Link>
    </ContentPage>
  )
}

export function WriteReviewPage() {
  const { lang } = useLang()
  return (
    <ContentPage
      title={lang === 'th' ? 'เขียนรีวิว' : 'Write a Review'}
      subtitle={
        lang === 'th'
          ? 'ช่วยแชร์ประสบการณ์ทริป — ตอนนี้รีวิวผ่าน Facebook Page ของเรา'
          : 'Share your trip experience — we collect reviews on our Facebook Page.'
      }
    >
      <div className="rounded-2xl border border-teal-600/30 bg-mint-100 p-6 text-center">
        <p className="font-serif text-lg text-ink">
          {lang === 'th' ? 'รีวิวบน Facebook' : 'Review us on Facebook'}
        </p>
        <p className="mt-2 text-sm text-ink-soft">
          {lang === 'th'
            ? 'กดลิงก์ด้านล่าง แล้วเขียนรีวิวสั้นๆ บนเพจ Trip2Talk — ช่วยให้นักเรียนคนอื่นเจอเรา'
            : 'Open our Page and leave a short review — it helps other Thai students find us.'}
        </p>
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-xl bg-[#1877F2] px-5 py-3 text-sm font-bold text-white"
        >
          {lang === 'th' ? 'เปิดเพจ Facebook' : 'Open Facebook Page'}
        </a>
        <a
          href={FACEBOOK_MESSENGER_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block text-sm font-semibold text-teal-700 underline"
        >
          {lang === 'th' ? 'หรือทัก Messenger' : 'Or message us on Messenger'}
        </a>
        <p className="mt-4 text-[11px] text-ink-soft">
          Google Reviews link is not configured yet (contact.googleReviews is disabled).
          <span className="mt-0.5 block font-thai">ลิงก์ Google Reviews ยังไม่ได้ตั้งค่า</span>
        </p>
      </div>
    </ContentPage>
  )
}

export function NotFoundPage() {
  const { lang } = useLang()
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="font-serif text-6xl text-teal-500">404</p>
      <BiDisplayHeading
        en="Page not found"
        th="ไม่พบหน้านี้"
        as="h1"
        className="mt-3"
        enClassName="text-2xl font-semibold text-ink"
        thClassName="mt-1 text-sm font-medium text-ink-soft"
      />
      <p className="mt-2 text-sm text-ink-soft">
        That link may be outdated, or the page is still on the way.
        <span lang="th" className="mt-1 block font-serif font-thai">
          ลิงก์อาจหมดอายุ หรือหน้ายังไม่ถูกสร้าง
        </span>
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn-embossed">
          {lang === 'th' ? 'หน้าแรก' : 'Home'}
        </Link>
        <Link
          to="/trips"
          className="rounded-full border border-line bg-mint-100 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-ink"
        >
          {lang === 'th' ? 'ทริปทั้งหมด' : 'All trips'}
        </Link>
      </div>
    </div>
  )
}
