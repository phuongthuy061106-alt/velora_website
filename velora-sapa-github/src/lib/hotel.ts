// Dữ liệu khách sạn giả lập Velora Hotel Sa Pa.
// Nguồn: tài liệu "Thông tin", thẻ Tổng (giờ giấc lấy từ thẻ FQA).
import type { StaticImageData } from "next/image";
import imgSuperior from "@/assets/img/room-superior.jpg";
import imgDeluxe from "@/assets/img/room-deluxe.jpg";
import imgFamily from "@/assets/img/room-family.jpg";
import imgSuite from "@/assets/img/room-suite.jpg";

export type Lang = "vi" | "en";
export type Text = Record<Lang, string>;

export type RoomType = {
  id: string; // slug, dùng cho URL và API
  rank: number; // hạng phòng, dùng cho luật "chỉ đổi lên hạng"
  name: string;
  area: number;
  beds: Text;
  maxAdults: number;
  maxChildren: number;
  childAgeLimit: 6 | 12; // trẻ DƯỚI tuổi này mới tính là trẻ em trong sức chứa
  pricePerNight: number;
  inventory: number; // giả định số phòng mỗi loại (tổng 80)
  view?: Text;
  summary: Text;
  amenities: Text[];
  image: StaticImageData;
};

export const ROOMS: RoomType[] = [
  {
    id: "superior",
    rank: 1,
    name: "Superior",
    area: 25,
    beds: { vi: "1 giường đôi hoặc 2 giường đơn", en: "1 double or 2 single beds" },
    maxAdults: 2,
    maxChildren: 1,
    childAgeLimit: 6,
    pricePerNight: 1_400_000,
    inventory: 30,
    view: { vi: "Hướng phố", en: "Street view" },
    summary: {
      vi: "Căn phòng gọn gàng nhìn ra mái ngói phố núi, đủ ấm cho những ngày sương xuống sớm.",
      en: "A compact room above the tiled roofs of town, warm enough for the days when mist rolls in early.",
    },
    amenities: [
      { vi: "Hướng phố", en: "Street view" },
      { vi: "Điều hòa 2 chiều", en: "Air-conditioning" },
      { vi: "TV, wifi", en: "TV, wifi" },
      { vi: "Minibar, két sắt", en: "Minibar, safe" },
      { vi: "Vòi sen", en: "Shower" },
    ],
    image: imgSuperior,
  },
  {
    id: "deluxe-mountain-view",
    rank: 2,
    name: "Deluxe Mountain View",
    area: 30,
    beds: { vi: "1 giường king hoặc 2 giường đơn", en: "1 king or 2 single beds" },
    maxAdults: 2,
    maxChildren: 1,
    childAgeLimit: 12,
    pricePerNight: 1_850_000,
    inventory: 28,
    view: { vi: "Nhìn núi", en: "Mountain view" },
    summary: {
      vi: "Khung cửa sổ lớn đặt dãy Hoàng Liên Sơn ngay đầu giường, kèm bàn làm việc cho khách công tác.",
      en: "A wide window puts the Hoang Lien Son range at the foot of the bed, with a proper desk for working trips.",
    },
    amenities: [
      { vi: "Cửa sổ lớn nhìn núi", en: "Large mountain-view window" },
      { vi: "Bàn làm việc", en: "Work desk" },
      { vi: "Máy pha cà phê", en: "Coffee machine" },
    ],
    image: imgDeluxe,
  },
  {
    id: "family-room",
    rank: 3,
    name: "Family Room",
    area: 42,
    beds: { vi: "1 giường king + 1 giường đơn", en: "1 king + 1 single bed" },
    maxAdults: 2,
    maxChildren: 2,
    childAgeLimit: 12,
    pricePerNight: 2_650_000,
    inventory: 14,
    summary: {
      vi: "Thêm phòng khách nhỏ và bồn tắm, có sẵn đồ dùng cho trẻ để cả nhà không phải mang theo nhiều.",
      en: "A small living area and a bathtub, with children's essentials ready so the family can pack light.",
    },
    amenities: [
      { vi: "Phòng khách nhỏ", en: "Small living area" },
      { vi: "Bồn tắm", en: "Bathtub" },
      { vi: "Đồ dùng trẻ em", en: "Children's amenities" },
      { vi: "Tủ lạnh lớn", en: "Large fridge" },
    ],
    image: imgFamily,
  },
  {
    id: "executive-suite",
    rank: 4,
    name: "Executive Suite",
    area: 55,
    beds: { vi: "1 giường king", en: "1 king bed" },
    maxAdults: 2,
    maxChildren: 1,
    childAgeLimit: 12,
    pricePerNight: 3_800_000,
    inventory: 8,
    view: { vi: "Ban công nhìn núi", en: "Mountain-view balcony" },
    summary: {
      vi: "Phòng khách riêng, bồn tắm nằm và ban công gỗ để ngắm biển mây lúc bình minh.",
      en: "A separate living room, a soaking tub and a timber balcony for watching the sea of clouds at sunrise.",
    },
    amenities: [
      { vi: "Phòng khách riêng", en: "Separate living room" },
      { vi: "Bồn tắm nằm", en: "Soaking tub" },
      { vi: "Ban công view núi", en: "Mountain-view balcony" },
      { vi: "Ưu tiên nhận và trả phòng", en: "Priority check-in and check-out" },
    ],
    image: imgSuite,
  },
];

export const roomById = (id: string) => ROOMS.find((r) => r.id === id);

export const HOTEL = {
  name: "Velora Hotel",
  stars: 4,
  rooms: 80,
  floors: 9,
  address: "Số 29, Đường Thác Bạc, TDP Sa Pa 5, Phường Sa Pa, Tỉnh Lào Cai, Việt Nam",
  phone: "0214 356 5555",
  hotline: "0868 588 824",
  email: "novara.hotel@gmail.com",
  checkIn: "14:00",
  checkOut: "12:00",
  depositRate: 0.5,
};

export const HOURS: { label: Text; value: Text }[] = [
  { label: { vi: "Nhận phòng", en: "Check-in" }, value: { vi: "Từ 14:00", en: "From 14:00" } },
  { label: { vi: "Trả phòng", en: "Check-out" }, value: { vi: "Trước 12:00", en: "Before 12:00" } },
  {
    label: { vi: "Ăn sáng buffet", en: "Breakfast buffet" },
    value: { vi: "06:30 – 10:30, cuối tuần đến 11:00", en: "06:30 – 10:30, weekends until 11:00" },
  },
  { label: { vi: "Nhà hàng Mây Núi", en: "Mây Núi restaurant" }, value: { vi: "11:00 – 22:00", en: "11:00 – 22:00" } },
  { label: { vi: "Hồ bơi nước ấm", en: "Heated pool" }, value: { vi: "06:00 – 21:00", en: "06:00 – 21:00" } },
  { label: { vi: "Phòng gym", en: "Gym" }, value: { vi: "06:00 – 22:00", en: "06:00 – 22:00" } },
  { label: { vi: "Spa", en: "Spa" }, value: { vi: "10:00 – 22:00", en: "10:00 – 22:00" } },
  { label: { vi: "Lễ tân", en: "Reception" }, value: { vi: "24/7", en: "24/7" } },
];

export type PriceRow = { name: Text; detail?: Text; price: Text };

/* ---------------- Dịch vụ đặt kèm (thẻ Tổng, mục 3) ---------------- */
export type ServiceGroup = "spa" | "transfer" | "tour" | "laundry";
export type ServiceItem = {
  id: string;
  group: ServiceGroup;
  name: Text;
  detail?: Text;
  price: number;
  unit: Text; // đơn vị tính, dùng cho cả trang Dịch vụ và bước chọn dịch vụ khi đặt phòng
};

export const SERVICE_ITEMS: ServiceItem[] = [
  { id: "spa-body", group: "spa", name: { vi: "Massage body", en: "Body massage" }, detail: { vi: "60 phút", en: "60 min" }, price: 600_000, unit: { vi: "lượt", en: "session" } },
  { id: "spa-foot", group: "spa", name: { vi: "Massage chân", en: "Foot massage" }, detail: { vi: "45 phút", en: "45 min" }, price: 380_000, unit: { vi: "lượt", en: "session" } },
  { id: "spa-herbal", group: "spa", name: { vi: "Tắm lá thuốc người Dao đỏ", en: "Red Dao herbal bath" }, detail: { vi: "45 phút", en: "45 min" }, price: 250_000, unit: { vi: "người", en: "person" } },
  { id: "spa-couple", group: "spa", name: { vi: "Gói đôi", en: "Couple package" }, detail: { vi: "90 phút", en: "90 min" }, price: 1_700_000, unit: { vi: "gói", en: "package" } },
  { id: "car-4", group: "transfer", name: { vi: "Đưa đón ga Lào Cai, xe 4 chỗ", en: "Lao Cai station transfer, 4-seater" }, detail: { vi: "Xe riêng, đặt trước ít nhất 12 giờ", en: "Private car, book 12 hours ahead" }, price: 550_000, unit: { vi: "chiều", en: "way" } },
  { id: "car-7", group: "transfer", name: { vi: "Đưa đón ga Lào Cai, xe 7 chỗ", en: "Lao Cai station transfer, 7-seater" }, detail: { vi: "Xe riêng, đặt trước ít nhất 12 giờ", en: "Private car, book 12 hours ahead" }, price: 750_000, unit: { vi: "chiều", en: "way" } },
  { id: "tour-catcat", group: "tour", name: { vi: "Nửa ngày bản Cát Cát và thác Tiên Sa", en: "Half-day Cat Cat village and Tien Sa waterfall" }, price: 550_000, unit: { vi: "người", en: "person" } },
  { id: "tour-fansipan", group: "tour", name: { vi: "1 ngày Fansipan", en: "Full-day Fansipan" }, detail: { vi: "Vé cáp treo tính riêng", en: "Cable car ticket not included" }, price: 700_000, unit: { vi: "người", en: "person" } },
  { id: "laundry-shirt", group: "laundry", name: { vi: "Giặt ủi áo sơ mi", en: "Laundry, shirt" }, price: 40_000, unit: { vi: "món", en: "item" } },
  { id: "laundry-trousers", group: "laundry", name: { vi: "Giặt ủi quần dài", en: "Laundry, trousers" }, price: 50_000, unit: { vi: "món", en: "item" } },
  { id: "laundry-dress", group: "laundry", name: { vi: "Giặt ủi váy, đầm", en: "Laundry, skirt or dress" }, price: 90_000, unit: { vi: "món", en: "item" } },
  { id: "tour-tavan", group: "tour", name: { vi: "1 ngày bản Tả Van, Lao Chải, Mường Hoa", en: "Full-day Ta Van, Lao Chai and Muong Hoa villages" }, price: 850_000, unit: { vi: "người", en: "person" } },
];
export const serviceById = (id: string) => SERVICE_ITEMS.find((x) => x.id === id);

const vnd = (n: number, lang: Lang) => (lang === "vi" ? `${n.toLocaleString("vi-VN")}đ` : `${n.toLocaleString("en-US")} VND`);
const toRows = (g: ServiceGroup): PriceRow[] =>
  SERVICE_ITEMS.filter((x) => x.group === g).map((x) => ({
    name: x.name,
    detail: x.detail,
    price: { vi: `${vnd(x.price, "vi")}/${x.unit.vi}`, en: `${vnd(x.price, "en")} per ${x.unit.en}` },
  }));
export const SPA = toRows("spa");
export const TRANSFERS = toRows("transfer");
export const TOURS = toRows("tour");

/** Dịch vụ khác: liên hệ lễ tân, không có giá trong tài liệu. */
export const OTHER_SERVICES: { name: Text; price: Text }[] = [
  { name: { vi: "Dịch vụ đánh thức", en: "Wake-up call" }, price: { vi: "Liên hệ lễ tân", en: "Ask reception" } },
  { name: { vi: "Thuê xe máy", en: "Motorbike rental" }, price: { vi: "Liên hệ lễ tân", en: "Ask reception" } },
  { name: { vi: "Thuê áo ấm", en: "Warm clothing rental" }, price: { vi: "Liên hệ lễ tân", en: "Ask reception" } },
  { name: { vi: "Hỗ trợ đặt taxi", en: "Taxi booking" }, price: { vi: "Liên hệ lễ tân", en: "Ask reception" } },
];

/** Buffet sáng cho khách không lưu trú (khách lưu trú đã gồm trong giá phòng). */
export const BREAKFAST_GUESTS: PriceRow[] = [
  { name: { vi: "Người lớn", en: "Adult" }, price: { vi: "250.000đ", en: "250,000 VND" } },
  { name: { vi: "Trẻ 6–11 tuổi", en: "Child 6–11" }, price: { vi: "125.000đ", en: "125,000 VND" } },
  { name: { vi: "Trẻ dưới 6 tuổi", en: "Child under 6" }, price: { vi: "Miễn phí", en: "Free" } },
];

export const LAUNDRY: PriceRow[] = [
  { name: { vi: "Áo sơ mi", en: "Shirt" }, price: { vi: "40.000đ", en: "40,000 VND" } },
  { name: { vi: "Quần dài", en: "Trousers" }, price: { vi: "50.000đ", en: "50,000 VND" } },
  { name: { vi: "Váy, đầm", en: "Skirt, dress" }, price: { vi: "90.000đ", en: "90,000 VND" } },
  { name: { vi: "Các món khác", en: "Other items" }, price: { vi: "30.000đ – 120.000đ/món", en: "30,000 – 120,000 VND per item" } },
];

export const SURCHARGES: PriceRow[] = [
  { name: { vi: "Trẻ em trong sức chứa tiêu chuẩn của phòng", en: "Children within the room's standard occupancy" }, price: { vi: "Miễn phí", en: "Free" } },
  { name: { vi: "Thêm 1 trẻ em ngoài sức chứa tiêu chuẩn", en: "One extra child beyond standard occupancy" }, price: { vi: "100.000đ/trẻ/đêm", en: "100,000 VND per child per night" } },
  { name: { vi: "Trẻ từ 12 tuổi", en: "Children 12 and over" }, price: { vi: "Tính như người lớn", en: "Charged as adults" } },
  { name: { vi: "Giường phụ", en: "Extra bed" }, price: { vi: "200.000đ/khách/đêm", en: "200,000 VND per guest per night" } },
  { name: { vi: "Nhận phòng sớm trước 06:00", en: "Early check-in before 06:00" }, price: { vi: "100% tiền phòng", en: "100% of room rate" } },
  {
    name: { vi: "Nhận phòng sớm sau 06:00", en: "Early check-in after 06:00" },
    price: { vi: "50% tiền phòng, không gồm ăn sáng", en: "50% of room rate, breakfast not included" },
  },
  { name: { vi: "Trả phòng muộn trước 18:00", en: "Late check-out before 18:00" }, price: { vi: "50% tiền phòng", en: "50% of room rate" } },
  { name: { vi: "Trả phòng muộn sau 18:00", en: "Late check-out after 18:00" }, price: { vi: "100% tiền phòng", en: "100% of room rate" } },
];

export const CANCELLATION: PriceRow[] = [
  { name: { vi: "Hủy trước từ 10 ngày trở lên", en: "10 days or more before check-in" }, price: { vi: "Miễn phí", en: "Free" } },
  { name: { vi: "Hủy trước 4–9 ngày", en: "4–9 days before check-in" }, price: { vi: "50% tổng giá trị đơn phòng", en: "50% of the booking total" } },
  { name: { vi: "Hủy trước 1–3 ngày", en: "1–3 days before check-in" }, price: { vi: "100% tổng giá trị đơn phòng", en: "100% of the booking total" } },
];

/** Quy định đặt phòng (thẻ Tổng, mục 4). */
export const BOOKING_RULES: Text[] = [
  { vi: "Thông tin bắt buộc: họ tên, số điện thoại, email, số lượng khách, loại phòng.", en: "Required details: full name, phone number, email, number of guests and room type." },
  {
    vi: "Đặt cọc 50% tổng tiền phòng để giữ phòng. Nhân viên gửi hướng dẫn thanh toán sau khi khách xác nhận đơn.",
    en: "A 50% deposit of the room total holds the booking. Staff send payment instructions once you confirm the booking.",
  },
  { vi: "Giờ nhận phòng: 14:00. Giờ trả phòng: 12:00.", en: "Check-in from 14:00. Check-out by 12:00." },
];

export const REFUND_RULES: Text[] = [
  {
    vi: "Hoàn tiền trong vòng 7 ngày làm việc kể từ khi xác nhận yêu cầu hủy hợp lệ.",
    en: "Refunds are made within 7 working days of a valid cancellation being confirmed.",
  },
  {
    vi: "Hoàn về phương thức thanh toán ban đầu mà khách đã dùng để đặt cọc. Thời gian tiền về tài khoản có thể phụ thuộc ngân hàng hoặc ví điện tử (thường thêm 1–3 ngày làm việc).",
    en: "Refunds go back to the original deposit payment method. Arrival may depend on your bank or e-wallet (usually 1–3 more working days).",
  },
];

export const NO_REFUND: Text[] = [
  { vi: "Không đến nhận phòng.", en: "No-show." },
  { vi: "Trả phòng sớm: không hoàn tiền các đêm chưa sử dụng.", en: "Early check-out: unused nights are not refunded." },
  { vi: "Vi phạm nội quy khách sạn.", en: "Breach of hotel rules." },
];

export const CHANGE_RULES: Text[] = [
  { vi: "Thông báo cho khách sạn trước ít nhất 03 ngày so với ngày nhận phòng.", en: "Notify the hotel at least 3 days before check-in." },
  { vi: "Chỉ cho phép tăng hạng phòng.", en: "Room changes can only be upgrades." },
  { vi: "Thay đổi trong vòng 03 ngày trước ngày nhận phòng sẽ mất tiền đặt cọc.", en: "Changes within 3 days of check-in forfeit the deposit." },
];

/** Quy định chung: đủ 11 điều theo thẻ Tổng, song ngữ. */
export const HOUSE_RULES: Text[] = [
  {
    vi: "Quý khách vui lòng xuất trình hộ chiếu hoặc chứng minh nhân dân để làm thủ tục nhận phòng tại Lễ tân.",
    en: "Guests are kindly requested to present their passport or identity card when checking in at the Reception Desk.",
  },
  {
    vi: "Giờ nhận phòng là 14:00 và giờ trả phòng là 12:00 trưa. Nhận phòng sớm (trước 14:00) và trả phòng trễ (sau 12:00) sẽ được tính thêm phụ phí theo quy định của khách sạn; vui lòng báo trước. Việc gia hạn tùy thuộc tình trạng phòng: nếu phòng còn trống, quý khách trả phí theo quy định. Nếu quý khách không rời phòng khi hết thời hạn, Ban quản lý có quyền di chuyển người, hành lý và vật dụng ra khỏi phòng mà không chịu trách nhiệm hay chi phí nào.",
    en: "Check-in time is 14:00 and check-out time is 12:00 noon. Early check-in (before 14:00) and late check-out (after 12:00) incur a surcharge under hotel regulations; please notify us in advance. Extensions depend on room availability: if the room is free, the corresponding fee applies. If a guest does not vacate the room when the time has expired, Management may move the guest, luggage and belongings out of the room without liability or cost.",
  },
  {
    vi: "Không mang súng đạn, chất cháy nổ, chất độc hại, các chất gây nghiện, vật nuôi hoặc thực phẩm có mùi tanh hôi vào phòng nghỉ. Không nấu nướng, giặt là trong phòng nghỉ.",
    en: "Do not bring firearms, explosives, toxic substances, narcotics, pets, or strong-smelling food into guest rooms. Cooking and laundry are not permitted in guest rooms.",
  },
  {
    vi: "Không được hút thuốc trong phòng và những khu vực không được phép hút thuốc. Nếu vi phạm sẽ phạt phí 500.000 đồng cho mỗi lần vi phạm.",
    en: "Smoking is not permitted in rooms or in designated non-smoking areas. Violations will incur a fine of 500,000 VND per occurrence.",
  },
  {
    vi: "Nghiêm cấm tất cả các hành vi cờ bạc, mua dâm, sử dụng thuốc kích thích trong phạm vi khách sạn.",
    en: "All forms of gambling, prostitution, and use of stimulants are strictly prohibited within the hotel premises.",
  },
  {
    vi: "Quý khách vui lòng tự bảo quản tài sản, cất giữ vật có giá trị trong két an toàn trong phòng hoặc quầy lễ tân. Khách sạn chỉ chịu trách nhiệm với tài sản hoặc tiền được gửi tại quầy Lễ tân có biên nhận.",
    en: "Guests are kindly requested to safeguard their own belongings and store valuables in the in-room safe or at the Reception Desk. The hotel is only responsible for assets or money deposited at the Reception Desk with a receipt.",
  },
  {
    vi: "Khách sử dụng trang thiết bị, cơ sở vật chất của khách sạn phải có trách nhiệm bảo quản, không làm hư hỏng, đổ vỡ. Nếu vi phạm phạt phí theo giá niêm yết của vật dụng bị hư hỏng hoặc đổ vỡ.",
    en: "Guests using the hotel's equipment and facilities are responsible for their proper care and must not cause damage or breakage. Violations incur a fine at the listed price of the damaged item.",
  },
  {
    vi: "Quý khách vui lòng không tiếp khách riêng trên phòng. Trường hợp cần thiết, khách riêng phải đăng ký ở quầy Lễ tân và rời phòng ngủ trước 21:00.",
    en: "Guests are kindly requested not to receive personal visitors in their rooms. If necessary, visitors must register at the Reception Desk and leave the guest room before 21:00.",
  },
  {
    vi: "Khách sử dụng đồ ăn, nước uống trong minibar thanh toán trực tiếp ở quầy lễ tân theo giá quy định trong menu.",
    en: "Guests consuming food or drinks from the minibar pay directly at the Reception Desk according to the menu prices.",
  },
  { vi: "Không được phép mang thú cưng vào khách sạn.", en: "Pets are not allowed at the hotel." },
  {
    vi: "Khách cam kết thực hiện đúng nội quy trong thời gian lưu trú. Không chấp nhận việc sử dụng chất gây nghiện, mại dâm và các hành vi gây mất trật tự nơi công cộng như cãi nhau to tiếng, quát tháo, đánh nhau, hành hung hay không tôn trọng nhân viên. Nếu xảy ra, khách sạn sẽ không cho khách tiếp tục lưu trú và không hoàn lại tiền phòng đã đóng hoặc đã đăng ký nhưng chưa sử dụng.",
    en: "Guests must comply with all regulations during their stay. Narcotics, prostitution and disturbances in public areas, such as loud arguments, shouting, fighting, assault or disrespect toward staff, are not accepted. In such cases the hotel will end the stay and will not refund room charges paid or registered but unused.",
  },
];
