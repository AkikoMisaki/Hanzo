import { lookupPinyinForHanzi } from '../utils/pinyinUtils.js';

export const DEFAULT_GRAMMAR_DATA = [
  { id: 'g1', title: 'Câu với 是 (shì)', desc: 'Dùng để xác định, giới thiệu người hoặc sự vật.', formula: 'A + 是 + B', examples: ['我是学生。 | wǒ shì xuésheng. | (Tôi là học sinh)', '这是我的书。 | zhè shì wǒ de shū. | (Đây là sách của tôi)'] },
  { id: 'g2', title: 'Phủ định với 不 (bù)', desc: 'Dùng để phủ định hành động, trạng thái hoặc thói quen.', formula: '不 + Động từ/Tính từ', examples: ['我不吃辣。 | wǒ bù chī là. | (Tôi không ăn cay)', '他不高。 | tā bù gāo. | (Anh ấy không cao)'] },
  { id: 'g3', title: 'Phủ định với 没/没有 (méi/méiyǒu)', desc: 'Dùng để diễn đạt chưa làm hoặc không có.', formula: '没(有) + Động từ/Danh từ', examples: ['我没有钱。 | wǒ méiyǒu qián. | (Tôi không có tiền)', '他没去学校。 | tā méi qù xuéxiào. | (Anh ấy chưa đến trường)'] },
  { id: 'g4', title: 'Câu hỏi với 吗 (ma)', desc: 'Dùng để tạo câu hỏi Có/Không.', formula: 'Câu trần thuật + 吗？', examples: ['你是越南人吗？ | nǐ shì yuènán rén ma? | (Bạn là người Việt Nam phải không?)', '他来吗？ | tā lái ma? | (Anh ấy có đến không?)'] },
  { id: 'g5', title: 'Câu hỏi A不A', desc: 'Dùng để hỏi lựa chọn khẳng định/phủ định.', formula: 'Động từ/Tính từ + 不 + Động từ/Tính từ', examples: ['你去不去？ | nǐ qù bù qù? | (Bạn có đi không?)', '好不好？ | hǎo bù hǎo? | (Được không?)'] },
  { id: 'g6', title: 'Đại từ nghi vấn', desc: 'Dùng để hỏi người, vật, địa điểm, cách thức và nguyên nhân.', formula: '谁 / 什么 / 哪 / 哪儿 / 怎么 / 为什么', examples: ['他是谁？ | tā shì shéi? | (Anh ấy là ai?)', '你叫什么名字？ | nǐ jiào shénme míngzi? | (Bạn tên là gì?)', '你怎么去？ | nǐ zěnme qù? | (Bạn đi bằng cách nào?)'] },
  { id: 'g7', title: 'Sở hữu với 的 (de)', desc: 'Diễn đạt quan hệ sở hữu hoặc bổ nghĩa.', formula: 'A + 的 + B', examples: ['我的电脑 | wǒ de diànnǎo | (Máy tính của tôi)', '漂亮的衣服 | piàoliang de yīfu | (Quần áo đẹp)'] },
  { id: 'g8', title: '有/没有 (yǒu/méiyǒu)', desc: 'Diễn đạt có hoặc không có.', formula: 'Chủ ngữ + 有/没有 + Tân ngữ', examples: ['我有一个苹果。 | wǒ yǒu yí gè píngguǒ. | (Tôi có một quả táo)', '他没有时间。 | tā méiyǒu shíjiān. | (Anh ấy không có thời gian)'] },
  { id: 'g9', title: '在 (zài)', desc: 'Diễn đạt vị trí hoặc hành động đang diễn ra.', formula: 'Chủ ngữ + 在 + Địa điểm / 在 + Động từ', examples: ['我在家。 | wǒ zài jiā. | (Tôi đang ở nhà)', '他在看书。 | tā zài kàn shū. | (Anh ấy đang đọc sách)'] },
  { id: 'g10', title: 'Câu tồn hiện với 有', desc: 'Diễn đạt tại một nơi có người hoặc sự vật.', formula: 'Địa điểm + 有 + Danh từ', examples: ['桌子上有一个苹果。 | zhuōzi shàng yǒu yí gè píngguǒ. | (Trên bàn có một quả táo)'] },
  { id: 'g11', title: 'Số + lượng từ', desc: 'Diễn đạt số lượng người hoặc sự vật.', formula: 'Số + 个/本/杯/件… + Danh từ', examples: ['一个人 | yí gè rén | (Một người)', '两本书 | liǎng běn shū | (Hai quyển sách)', '三杯茶 | sān bēi chá | (Ba cốc trà)'] },
  { id: 'g12', title: 'Cấu trúc thời gian', desc: 'Diễn đạt thời điểm xảy ra hành động.', formula: 'Chủ ngữ + Thời gian + Động từ / Thời gian + Chủ ngữ + Động từ', examples: ['我明天去北京。 | wǒ míngtiān qù běijīng. | (Ngày mai tôi đi Bắc Kinh)', '明天我去北京。 | míngtiān wǒ qù běijīng. | (Ngày mai tôi đi Bắc Kinh)'] },
  { id: 'g13', title: '想 (xiǎng)', desc: 'Diễn đạt mong muốn hoặc ý định.', formula: '想 + Động từ', examples: ['我想喝水。 | wǒ xiǎng hē shuǐ. | (Tôi muốn uống nước)', '你想去哪儿？ | nǐ xiǎng qù nǎr? | (Bạn muốn đi đâu?)'] },
  { id: 'g14', title: '要 (yào)', desc: 'Diễn đạt muốn, cần hoặc dự định làm việc gì.', formula: '要 + Danh từ/Động từ', examples: ['我要一杯咖啡。 | wǒ yào yì bēi kāfēi. | (Tôi muốn một tách cà phê)', '我要去超市。 | wǒ yào qù chāoshì. | (Tôi cần đi siêu thị)'] },
  { id: 'g15', title: '会 (huì)', desc: 'Diễn đạt kỹ năng đã học hoặc khả năng sẽ xảy ra.', formula: '会 + Động từ', examples: ['我会说汉语。 | wǒ huì shuō hànyǔ. | (Tôi biết nói tiếng Trung)', '明天会下雨。 | míngtiān huì xià yǔ. | (Ngày mai trời sẽ mưa)'] },
  { id: 'g16', title: '能 (néng)', desc: 'Diễn đạt khả năng hoặc điều kiện cho phép thực hiện hành động.', formula: '能 + Động từ', examples: ['我能帮你吗？ | wǒ néng bāng nǐ ma? | (Tôi có thể giúp bạn không?)', '今天我不能来。 | jīntiān wǒ bù néng lái. | (Hôm nay tôi không thể đến)'] },
  { id: 'g17', title: '可以 (kěyǐ)', desc: 'Diễn đạt sự cho phép hoặc khả năng.', formula: '可以 + Động từ', examples: ['你可以进来。 | nǐ kěyǐ jìnlái. | (Bạn có thể vào)', '我可以借你的书吗？ | wǒ kěyǐ jiè nǐ de shū ma? | (Tôi có thể mượn sách của bạn không?)'] },
  { id: 'g18', title: '应该 (yīnggāi)', desc: 'Diễn đạt điều nên làm.', formula: '应该 + Động từ', examples: ['你应该多休息。 | nǐ yīnggāi duō xiūxi. | (Bạn nên nghỉ ngơi nhiều hơn)', '我们应该怎么做？ | wǒmen yīnggāi zěnme zuò? | (Chúng ta nên làm gì?)'] },
  { id: 'g19', title: '得 (děi)', desc: 'Diễn đạt phải hoặc cần phải làm việc gì.', formula: '得 + Động từ', examples: ['我得走了。 | wǒ děi zǒu le. | (Tôi phải đi rồi)', '你得好好学习。 | nǐ děi hǎohǎo xuéxí. | (Bạn phải học tập chăm chỉ)'] },
  { id: 'g20', title: '很/太/真', desc: 'Diễn đạt mức độ của tính chất hoặc trạng thái.', formula: '很/太/真 + Tính từ', examples: ['他很高。 | tā hěn gāo. | (Anh ấy rất cao)', '真漂亮！ | zhēn piàoliang! | (Thật đẹp!)'] },
  { id: 'g21', title: '太…了 (tài…le)', desc: 'Diễn đạt mức độ “quá/rất”.', formula: '太 + Tính từ + 了', examples: ['太好了！ | tài hǎo le! | (Quá tốt rồi!)', '太贵了！ | tài guì le! | (Quá đắt rồi!)'] },
  { id: 'g22', title: 'So sánh với 比 (bǐ)', desc: 'Dùng để so sánh A với B.', formula: 'A + 比 + B + Tính từ', examples: ['我比他高。 | wǒ bǐ tā gāo. | (Tôi cao hơn anh ấy)', '今天比昨天热。 | jīntiān bǐ zuótiān rè. | (Hôm nay nóng hơn hôm qua)'] },
  { id: 'g23', title: '没有…那么…', desc: 'Diễn đạt A không bằng B về một đặc điểm.', formula: 'A + 没有 + B + 那么 + Tính từ', examples: ['我没有他那么高。 | wǒ méiyǒu tā nàme gāo. | (Tôi không cao bằng anh ấy)'] },
  { id: 'g24', title: '一样 (yíyàng)', desc: 'Diễn đạt A và B giống nhau.', formula: 'A + 跟/和 + B + 一样', examples: ['我跟他一样大。 | wǒ gēn tā yíyàng dà. | (Tôi lớn bằng anh ấy)', '这件衣服和那件一样漂亮。 | zhè jiàn yīfu hé nà jiàn yíyàng piàoliang. | (Bộ quần áo này đẹp như bộ kia)'] },
  { id: 'g25', title: '最 (zuì)', desc: 'Diễn đạt mức độ cao nhất “nhất”.', formula: '最 + Tính từ', examples: ['他最高。 | tā zuì gāo. | (Anh ấy cao nhất)', '这是最好吃的菜。 | zhè shì zuì hǎochī de cài. | (Đây là món ăn ngon nhất)'] },
  { id: 'g26', title: 'Trợ từ 了', desc: 'Diễn đạt sự thay đổi trạng thái hoặc tình huống mới.', formula: 'Câu + 了', examples: ['下雨了。 | xià yǔ le. | (Trời mưa rồi)', '我不吃了。 | wǒ bù chī le. | (Tôi không ăn nữa)'] },
  { id: 'g27', title: 'Hoàn thành với 了', desc: 'Diễn đạt hành động đã hoàn thành.', formula: 'Động từ + 了 + Tân ngữ', examples: ['我买了一本书。 | wǒ mǎi le yì běn shū. | (Tôi đã mua một quyển sách)', '他去北京了。 | tā qù běijīng le. | (Anh ấy đã đi Bắc Kinh rồi)'] },
  { id: 'g28', title: 'Kinh nghiệm với 过 (guo)', desc: 'Diễn đạt đã từng trải qua hoặc làm việc gì.', formula: 'Động từ + 过', examples: ['我去过中国。 | wǒ qù guo zhōngguó. | (Tôi đã từng đi Trung Quốc)', '你看过这个电影吗？ | nǐ kàn guo zhège diànyǐng ma? | (Bạn đã từng xem bộ phim này chưa?)'] },
  { id: 'g29', title: '正在/在 (zhèngzài/zài)', desc: 'Diễn đạt hành động đang diễn ra.', formula: '正在/在 + Động từ', examples: ['我在吃饭。 | wǒ zài chī fàn. | (Tôi đang ăn cơm)', '他正在看电视。 | tā zhèngzài kàn diànshì. | (Anh ấy đang xem tivi)'] },
  { id: 'g30', title: '着 (zhe)', desc: 'Diễn đạt trạng thái hoặc hành động đang được duy trì.', formula: 'Động từ + 着', examples: ['门开着。 | mén kāi zhe. | (Cửa đang mở)', '他穿着一件红衣服。 | tā chuān zhe yí jiàn hóng yīfu. | (Anh ấy đang mặc một chiếc áo màu đỏ)'] },
  { id: 'g31', title: '快/要/快要…了', desc: 'Diễn đạt hành động sắp xảy ra.', formula: '快/要/快要 + Động từ + 了', examples: ['火车快要开了。 | huǒchē kuàiyào kāi le. | (Tàu hỏa sắp chạy rồi)', '快下雨了。 | kuài xià yǔ le. | (Sắp mưa rồi)'] },
  { id: 'g32', title: '先…再… (xiān…zài…)', desc: 'Diễn đạt “trước… sau đó…”.', formula: '先 + Hành động 1 + 再 + Hành động 2', examples: ['你先洗手再吃饭。 | nǐ xiān xǐ shǒu zài chī fàn. | (Bạn rửa tay trước rồi sau đó ăn cơm)'] },
  { id: 'g33', title: '一边…一边… (yìbiān…yìbiān…)', desc: 'Diễn đạt hai hành động xảy ra đồng thời.', formula: '一边 + V1 + 一边 + V2', examples: ['他一边吃饭一边看电视。 | tā yìbiān chī fàn yìbiān kàn diànshì. | (Anh ấy vừa ăn cơm vừa xem tivi)'] },
  { id: 'g34', title: '一…就… (yī…jiù…)', desc: 'Diễn đạt “vừa… thì/ngay…”.', formula: '一 + Hành động 1 + 就 + Hành động 2', examples: ['他一回家就做饭。 | tā yì huí jiā jiù zuò fàn. | (Anh ấy vừa về nhà là nấu ăn ngay)'] },
  { id: 'g35', title: '因为…所以… (yīnwèi…suǒyǐ…)', desc: 'Diễn đạt quan hệ nguyên nhân–kết quả.', formula: '因为 + Nguyên nhân + 所以 + Kết quả', examples: ['因为下雨，所以我们不去。 | yīnwèi xià yǔ, suǒyǐ wǒmen bú qù. | (Bởi vì trời mưa nên chúng tôi không đi)'] },
  { id: 'g36', title: '虽然…但是… (suīrán…dànshì…)', desc: 'Diễn đạt “tuy… nhưng…”.', formula: '虽然 + A + 但是 + B', examples: ['虽然很累，但是他很开心。 | suīrán hěn lèi, dànshì tā hěn kāixīn. | (Mặc dù rất mệt nhưng anh ấy rất vui)'] },
  { id: 'g37', title: '如果…就… (rúguǒ…jiù…)', desc: 'Diễn đạt “nếu… thì…”.', formula: '如果 + Điều kiện + 就 + Kết quả', examples: ['如果你去，我就去。 | rúguǒ nǐ qù, wǒ jiù qù. | (Nếu bạn đi, tôi sẽ đi)'] },
  { id: 'g38', title: '除了…以外… (chúle…yǐwài…)', desc: 'Diễn đạt “ngoài… ra”.', formula: '除了 + A + 以外 + …', examples: ['除了我以外，大家都去了。 | chúle wǒ yǐwài, dàjiā dōu qù le. | (Ngoài tôi ra, mọi người đều đã đi)'] },
  { id: 'g39', title: '又…又… (yòu…yòu…)', desc: 'Diễn đạt “vừa… vừa…”.', formula: '又 + Tính từ/Động từ + 又 + Tính từ/Động từ', examples: ['这个苹果又大又甜。 | zhège píngguǒ yòu dà yòu tián. | (Quả táo này vừa to vừa ngọt)', '他又聪明又帅。 | tā yòu cōngmíng yòu shuài. | (Anh ấy vừa thông minh vừa đẹp trai)'] },
  { id: 'g40', title: '越来越… (yuèláiyuè…)', desc: 'Diễn đạt “ngày càng…”.', formula: '越来越 + Tính từ/Trạng thái', examples: ['天气越来越热了。 | tiānqì yuèláiyuè rè le. | (Thời tiết ngày càng nóng)', '他的汉语越来越好。 | tā de hànyǔ yuèláiyuè hǎo. | (Tiếng Trung của anh ấy ngày càng tốt)'] },
  { id: 'g41', title: '越…越… (yuè…yuè…)', desc: 'Diễn đạt “càng… càng…”.', formula: '越 + A + 越 + B', examples: ['雨越下越大。 | yǔ yuè xià yuè dà. | (Mưa càng lúc càng lớn)', '东西越便宜越好。 | dōngxi yuè piányi yuè hǎo. | (Đồ càng rẻ càng tốt)'] },
  { id: 'g42', title: 'Câu 把 (bǎ)', desc: 'Nhấn mạnh cách xử lý hoặc tác động lên tân ngữ.', formula: 'Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác', examples: ['请把门打开。 | qǐng bǎ mén dǎkāi. | (Vui lòng mở cửa)', '我把书看完了。 | wǒ bǎ shū kàn wán le. | (Tôi đã đọc xong sách rồi)'] },
  { id: 'g43', title: 'Câu 被 (bèi)', desc: 'Diễn đạt câu bị động.', formula: 'Chủ ngữ + 被 + Tác nhân + Động từ', examples: ['苹果被我吃了。 | píngguǒ bèi wǒ chī le. | (Quả táo đã bị tôi ăn rồi)', '我的钱包被偷了。 | wǒ de qiánbāo bèi tōu le. | (Ví của tôi bị trộm rồi)'] },
  { id: 'g44', title: 'Bổ ngữ kết quả', desc: 'Diễn đạt kết quả đạt được sau hành động.', formula: 'Động từ + 完/到/懂/好/见…', examples: ['我看完了。 | wǒ kàn wán le. | (Tôi đã xem xong rồi)', '我听懂了。 | wǒ tīng dǒng le. | (Tôi đã nghe hiểu rồi)'] },
  { id: 'g45', title: 'Bổ ngữ xu hướng', desc: 'Diễn đạt hướng chuyển động của hành động.', formula: 'Động từ + 来/去/上/下/进/出/回/过/起…', examples: ['他走进来了。 | tā zǒu jìnlái le. | (Anh ấy bước vào trong rồi)', '请拿过去。 | qǐng ná guòqù. | (Vui lòng mang qua đó)'] },
  { id: 'g46', title: 'Bổ ngữ khả năng', desc: 'Diễn đạt có hoặc không có khả năng đạt được kết quả.', formula: 'Động từ + 得/不 + Bổ ngữ', examples: ['我听得懂。 | wǒ tīng de dǒng. | (Tôi có thể nghe hiểu)', '我看不见。 | wǒ kàn bú jiàn. | (Tôi không thể nhìn thấy)'] },
  { id: 'g47', title: 'Bổ ngữ mức độ với 得 (de)', desc: 'Mô tả mức độ hoặc trạng thái của hành động.', formula: 'Động từ + 得 + Tính từ/Bổ ngữ', examples: ['他跑得很快。 | tā pǎo de hěn kuài. | (Anh ấy chạy rất nhanh)', '你做得很好。 | nǐ zuò de hěn hǎo. | (Bạn làm rất tốt)'] },
  { id: 'g48', title: '让/叫 (ràng/jiào)', desc: 'Diễn đạt để, bảo hoặc yêu cầu ai làm việc gì.', formula: '让/叫 + Người + Động từ', examples: ['妈妈让我去买东西。 | māma ràng wǒ qù mǎi dōngxi. | (Mẹ bảo tôi đi mua đồ)', '他叫我过来。 | tā jiào wǒ guòlái. | (Anh ấy gọi tôi qua đây)'] },
  { id: 'g49', title: '给 (gěi)', desc: 'Diễn đạt cho hoặc thực hiện hành động hướng tới ai đó.', formula: '给 + Người + Danh từ/Động từ hoặc Chủ ngữ + 给 + Người + Động từ', examples: ['我给你一本书。 | wǒ gěi nǐ yì běn shū. | (Tôi đưa cho bạn một quyển sách)', '请给我打电话。 | qǐng gěi wǒ dǎ diànhuà. | (Vui lòng gọi điện cho tôi)'] },
  { id: 'g50', title: '对…来说 (duì…láishuō)', desc: 'Diễn đạt “đối với… mà nói”.', formula: '对 + Người/Sự vật + 来说 + Nhận xét', examples: ['对我来说，汉语不难。 | duì wǒ lái shuō, hànyǔ bù nán. | (Đối với tôi mà nói, tiếng Trung không khó)'] }
];

export function getStoredGrammarData() {
  try {
    const raw = localStorage.getItem('hanzo_grammar_list_v2');
    const list = raw ? JSON.parse(raw) : [];
    if (!list || list.length === 0) {
      localStorage.setItem('hanzo_grammar_list_v2', JSON.stringify(DEFAULT_GRAMMAR_DATA));
      return DEFAULT_GRAMMAR_DATA;
    }
    return list;
  } catch (e) {
    return DEFAULT_GRAMMAR_DATA;
  }
}

export function saveStoredGrammarData(data) {
  try {
    localStorage.setItem('hanzo_grammar_list_v2', JSON.stringify(data));
  } catch (e) {}
}

export function renderGrammarView(container) {
  const grammarData = getStoredGrammarData();
  let currentFilter = 'all'; // 'all' | 'mastered' | 'learning' | 'unlearned'
  let currentHskFilter = 'all'; // 'all' | 'HSK 1' | ...

  // Calculate mastery statistics
  const masteredCount = grammarData.filter(g => g.masteryLevel >= 4).length;
  const learningCount = grammarData.filter(g => g.masteryLevel > 0 && g.masteryLevel < 4).length;
  const unlearnedCount = grammarData.filter(g => !g.masteryLevel || g.masteryLevel === 0).length;

  const stats = {
    total: grammarData.length,
    learned: masteredCount + learningCount,
    mastered: masteredCount,
    score: grammarData.reduce((acc, g) => acc + (g.score || 0), 0)
  };

  container.innerHTML = `
    <!-- Top Action Bar -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 class="font-black text-2xl sm:text-3xl text-red-950 tracking-tight flex items-center gap-2">
          <span>📚</span> <span>Học Ngữ Pháp</span>
        </h1>
        <p class="text-xs text-slate-500 font-semibold mt-1">Hệ thống tổng hợp các cấu trúc ngữ pháp Tiếng Trung HSK kèm ví dụ minh họa</p>
      </div>
      <div class="flex items-center gap-2.5 shrink-0 flex-wrap">
        <!-- Xuất Excel -->
        <button id="btn-export-grammar-excel" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Xuất toàn bộ danh sách cấu trúc ngữ pháp ra file Excel (.csv UTF-8)">
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="5" fill="#107C41"/>
            <path d="M13.8 12L17.5 17.5H14.9L12.4 13.7L9.9 17.5H7.3L11 12L7.5 6.5H10.1L12.4 10.1L14.7 6.5H17.3L13.8 12Z" fill="white"/>
          </svg>
          <span>Xuất Excel</span>
        </button>

        <!-- Nhập Excel -->
        <button id="btn-import-grammar-excel" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Tạo mới hàng loạt cấu trúc ngữ pháp từ tệp Excel (.csv)">
          <svg class="w-5 h-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
          </svg>
          <span>Nhập Excel</span>
        </button>
        <input type="file" id="grammar-excel-file-input" accept=".csv,.txt" class="hidden" />

        <!-- Mẫu -->
        <button id="btn-download-grammar-template" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Tải file Excel mẫu hướng dẫn cấu trúc dữ liệu">
          <svg class="w-5 h-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <span>Mẫu</span>
        </button>

        <!-- Quy Tắc -->
        <button id="btn-open-mastery-guide" class="btn bg-white hover:bg-red-50/60 text-red-900 border border-red-200/90 font-bold px-4 py-2 rounded-full shadow-md shadow-red-100/70 hover:shadow-lg hover:border-red-300 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-95" title="Xem bảng quy tắc đánh giá mức độ thành thạo ngữ pháp">
          <svg class="w-5 h-5 shrink-0 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
          </svg>
          <span>Quy Tắc</span>
        </button>

        <!-- Mini-Game -->
        <button id="btn-start-global-grammar-game" class="btn bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-5 py-2 rounded-full shadow-lg shadow-red-500/35 hover:shadow-xl hover:shadow-red-500/45 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap" title="Luyện tập ngẫu nhiên ví dụ từ tất cả cấu trúc ngữ pháp">
          <svg class="w-5 h-5 shrink-0 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H9v2H7v-2H5v-2h2V9h2v2h2v2zm4.5 1c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3-3c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
          <span>Mini-Game</span>
        </button>

        <!-- Tạo Cấu Trúc Mới -->
        <button id="btn-create-grammar" class="btn bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-bold px-5 py-2 rounded-full shadow-lg shadow-red-500/35 hover:shadow-xl hover:shadow-red-500/45 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap" title="Tạo mới cấu trúc ngữ pháp">
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="white"/>
            <path d="M12 7.5v9M7.5 12h9" stroke="#e11d48" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span>Tạo Cấu Trúc Mới</span>
        </button>
      </div>
    </div>

        <!-- Grammar Analytics Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      <!-- Card 1: Cấu trúc đã học -->
      <div class="glass-panel p-4 rounded-3xl border border-rose-200/80 bg-gradient-to-r from-rose-50/70 via-white to-rose-50/50 shadow-sm hover:shadow-md transition flex items-center justify-between relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
            </svg>
          </div>
          <div>
            <div class="text-2xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <span>CẤU TRÚC ĐÃ HỌC</span>
              <svg class="w-3.5 h-3.5 text-slate-400 cursor-pointer inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" title="Số lượng cấu trúc ngữ pháp bạn đã bắt đầu ôn luyện">
                <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4m0-4h.01"/>
              </svg>
            </div>
            <div class="mt-0.5 flex items-baseline gap-1">
              <span class="text-2xl font-black text-red-950 font-mono">${stats.learned}</span>
              <span class="text-slate-400 font-bold text-sm font-mono">/ ${stats.total}</span>
            </div>
          </div>
        </div>
        <div class="flex items-end gap-1 opacity-25 shrink-0">
          <div class="w-1.5 h-4 bg-red-500 rounded-full"></div>
          <div class="w-1.5 h-6 bg-red-500 rounded-full"></div>
          <div class="w-1.5 h-8 bg-red-500 rounded-full"></div>
          <div class="w-1.5 h-5 bg-red-500 rounded-full"></div>
        </div>
      </div>

      <!-- Card 2: Điểm số luyện tập -->
      <div class="glass-panel p-4 rounded-3xl border border-rose-200/80 bg-gradient-to-r from-amber-50/60 via-white to-rose-50/40 shadow-sm hover:shadow-md transition flex items-center justify-between relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-400/35 shrink-0">
            <svg class="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
          </div>
          <div>
            <div class="text-2xs font-extrabold uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <span>ĐIỂM SỐ LUYỆN TẬP</span>
              <svg class="w-3.5 h-3.5 text-slate-400 cursor-pointer inline-block" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" title="Tổng điểm tích lũy từ các bài mini-game ngữ pháp">
                <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 16v-4m0-4h.01"/>
              </svg>
            </div>
            <div class="mt-0.5">
              <span class="text-2xl font-black text-red-950 font-mono">${stats.score}</span>
            </div>
          </div>
        </div>
        <div class="flex items-end gap-1 opacity-25 shrink-0">
          <div class="w-1.5 h-3 bg-amber-500 rounded-full"></div>
          <div class="w-1.5 h-5 bg-amber-500 rounded-full"></div>
          <div class="w-1.5 h-7 bg-amber-500 rounded-full"></div>
        </div>
      </div>

      <!-- Card 3: Tùy chỉnh thử thách -->
      <div id="btn-launch-challenge-card" class="glass-panel p-4 rounded-3xl border border-rose-300/80 bg-gradient-to-r from-red-50/90 via-rose-100/70 to-red-100/80 shadow-md hover:shadow-lg hover:scale-[1.01] transition flex items-center justify-between cursor-pointer group relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/30 shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="12" cy="12" r="1"/>
            </svg>
          </div>
          <div>
            <div class="text-xs font-black uppercase text-red-950 tracking-tight leading-tight">
              TÙY CHỈNH THỬ THÁCH
            </div>
            <div class="text-2xs font-semibold text-slate-600 mt-0.5">
              Chọn Cấu Trúc & Ôn Luyện
            </div>
          </div>
        </div>
        <div class="w-9 h-9 rounded-full bg-white text-red-600 shadow-md flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition shrink-0">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Main Content Header, Banner & Filters -->
    <div class="bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-red-100/60 rounded-3xl p-5 border border-rose-200/70 shadow-sm relative overflow-hidden mb-6">
      <div class="flex flex-col lg:flex-row items-stretch gap-6 relative z-10">
        
        <!-- Left Side: Title, Subtitle, Watermark & Mastery Filters -->
        <div class="flex-1 flex flex-col justify-between space-y-4 relative">
          <!-- Title & Subtitle block -->
          <div class="flex items-center gap-3 relative z-10">
            <div class="w-11 h-11 rounded-2xl bg-red-100/90 flex justify-center items-center text-red-600 shrink-0 shadow-2xs">
              <svg class="w-6 h-6 text-red-600 fill-current" viewBox="0 0 24 24">
                <path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
              </svg>
            </div>
            <div class="h-8 w-px bg-rose-300/60"></div>
            <div>
              <h2 class="font-black text-xl text-red-950 tracking-tight leading-tight">Các Cấu Trúc Trọng Tâm</h2>
              <p class="text-2xs font-semibold text-slate-500 mt-0.5">Học theo chủ đề và luyện tập hiệu quả hơn</p>
            </div>

            <!-- Watermark Pushpin inside left column -->
            <div class="absolute right-2 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none text-red-300 hidden sm:block">
              <svg class="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 9V4l1 0c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1l1 0v5c0 1.66-1.34 3-3 3v2h5.97v7l1 1 1-1v-7H19v-2c-1.66 0-3-1.34-3-3z"/>
              </svg>
            </div>
          </div>

          <!-- Mastery Filter Tabs -->
          <div class="flex items-center gap-2.5 overflow-x-auto pb-0.5 relative z-10" id="grammar-filter-tabs">
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-bold text-xs shadow-md shadow-red-500/30 flex items-center gap-2 cursor-pointer active-filter whitespace-nowrap" data-filter="all">
              <svg class="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
              <span>Tất Cả (${grammarData.length})</span>
            </button>
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap" data-filter="mastered">
              <span class="text-amber-500 text-sm">🏆</span>
              <span>Đã Thành Thạo (${masteredCount})</span>
            </button>
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap" data-filter="learning">
              <span class="text-emerald-500 text-sm">🌱</span>
              <span>Đang Học (${learningCount})</span>
            </button>
            <button class="btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap" data-filter="unlearned">
              <span class="text-purple-500 text-sm">🌙</span>
              <span>Chưa Ôn (${unlearnedCount})</span>
            </button>
          </div>
        </div>

        <!-- Middle Vertical Divider Line -->
        <div class="hidden lg:block w-px bg-rose-200/90 my-1 self-stretch"></div>

        <!-- Right Side: Search Input & HSK Quick Filter Tabs -->
        <div class="flex-1 flex flex-col justify-between space-y-4">
          <!-- Search Bar -->
          <div class="relative w-full">
            <div class="flex items-center bg-white rounded-full border border-rose-200/90 shadow-sm pl-4 pr-1.5 py-1.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
              <svg class="w-4 h-4 text-red-500 shrink-0 mr-2" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input type="text" id="search-grammar-input" class="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none" placeholder="Tìm kiếm ngữ pháp..." />
              <button type="button" id="btn-search-grammar-trigger" class="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer transition">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Quick HSK Filter Buttons -->
          <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5" id="grammar-hsk-filter-tabs">
            <span class="text-2xs font-extrabold text-red-900/80 shrink-0 uppercase tracking-wider flex items-center gap-1">
              <span>🏷️</span> <span>Cấp độ HSK:</span>
            </span>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-extrabold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-xs cursor-pointer active-hsk-filter whitespace-nowrap transition-all" data-hsk="all">Tất cả HSK</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 1">HSK 1</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 2">HSK 2</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 3">HSK 3</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 4">HSK 4</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 5">HSK 5</button>
            <button class="btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap" data-hsk="HSK 6">HSK 6</button>
          </div>
        </div>

      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10" id="grammar-cards-container">
      ${grammarData.map((g, idx) => renderCard(g, idx)).join('')}
    </div>

    <!-- Practice Config Modal -->
    <div id="grammar-config-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md shrink-0">
          <div class="flex items-center gap-2.5 font-bold text-lg">
            <span class="text-2xl">🎯</span>
            <div>
              <h3 class="font-black text-lg leading-tight text-white">Tùy Chỉnh Ôn Luyện Ngữ Pháp</h3>
              <p class="text-2xs text-red-100 font-normal">Chọn cấu trúc & chế độ kiểm tra phù hợp với bạn</p>
            </div>
          </div>
          <button id="btn-close-grammar-config" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6 overflow-y-auto grow">
          <!-- Mode Selection -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">1. Chọn Chế Độ Luyện Tập *</label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label id="lbl-mode-random" class="config-mode-card flex items-start gap-3 p-4 rounded-2xl border-2 border-red-500 bg-red-50/40 cursor-pointer hover:shadow-sm transition">
                <input type="radio" name="practice-order-mode" value="random" checked class="mt-1 text-red-600 focus:ring-red-500" />
                <div>
                  <div class="font-black text-slate-800 text-sm flex items-center gap-1.5">🔀 Kiểm Tra Ngẫu Nhiên</div>
                  <div class="text-2xs text-slate-500 font-medium mt-0.5">Trộn ngẫu nhiên các câu ví dụ từ những cấu trúc đã chọn.</div>
                </div>
              </label>
              <label id="lbl-mode-sequential" class="config-mode-card flex items-start gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white cursor-pointer hover:border-red-300 transition">
                <input type="radio" name="practice-order-mode" value="sequential" class="mt-1 text-red-600 focus:ring-red-500" />
                <div>
                  <div class="font-black text-slate-800 text-sm flex items-center gap-1.5">➡️ Kiểm Tra Tuần Tự (Chủ Đề Liên Quan)</div>
                  <div class="text-2xs text-slate-500 font-medium mt-0.5">Kiểm tra lần lượt theo thứ tự chủ đề liên quan (Căn bản -> Phủ định -> Bổ ngữ...).</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Question Count Selection -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">2. Số Lượng Câu Ví Dụ Luyện Tập</label>
            <div class="flex items-center gap-2.5 flex-wrap" id="config-count-options">
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer" data-count="5">5 Câu</button>
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border-2 border-red-500 bg-red-50 font-black text-xs text-red-800 shadow-2xs cursor-pointer active-count" data-count="10">10 Câu (Mặc định)</button>
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer" data-count="20">20 Câu</button>
              <button type="button" class="btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer" data-count="all">Tất Cả Câu</button>
            </div>
          </div>

          <!-- Grammar Structures Selector -->
          <div>
            <div class="flex justify-between items-center mb-2.5">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-500">3. Tùy Chọn Cấu Trúc Ngữ Pháp (<span id="config-selected-count" class="text-red-600">0</span>/<span id="config-total-count">0</span>)</label>
              <div class="flex items-center gap-2">
                <button type="button" id="btn-config-select-all" class="text-2xs font-bold text-red-600 hover:underline cursor-pointer">Chọn Tất Cả</button>
                <span class="text-slate-300">|</span>
                <button type="button" id="btn-config-deselect-all" class="text-2xs font-bold text-slate-400 hover:underline cursor-pointer">Bỏ Chọn Tất Cả</button>
              </div>
            </div>

            <div class="relative mb-3">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              <input type="text" id="config-search-grammar" class="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 outline-none focus:border-red-400" placeholder="Lọc nhanh tên cấu trúc..." />
            </div>

            <div id="config-grammar-list" class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              <!-- Checkboxes dynamically rendered -->
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
          <button type="button" id="btn-cancel-grammar-config" class="px-5 py-2 rounded-full border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition text-sm cursor-pointer">Hủy</button>
          <button type="button" id="btn-start-configured-game" class="px-6 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-red-200 transition text-sm cursor-pointer">
            <span>🎮</span> <span>Bắt Đầu Ôn Luyện</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Game Modal -->
    <div id="grammar-game-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col border border-slate-100 my-auto">
        
        <!-- Header -->
        <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-sm">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">🧩</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Luyện Tập Ngữ Pháp</h3>
              <div id="grammar-game-badge" class="text-2xs font-extrabold text-red-100 tracking-wide uppercase">Tất cả cấu trúc</div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div id="grammar-game-streak" class="flex items-center gap-1 bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full border border-white/30 shadow-2xs">
              <span>🔥</span> <span id="game-streak-count">0</span>
            </div>
            <button id="btn-close-grammar-game" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 text-white/90 hover:text-white transition cursor-pointer">✕</button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6">
          <div class="flex justify-between items-center mb-3">
            <span class="text-2xs font-extrabold uppercase tracking-wider text-slate-400" id="game-progress-label">Câu 1</span>
            <button id="btn-game-tts" class="text-xs font-bold text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-full transition flex items-center gap-1 cursor-pointer" title="Nghe phát âm chuẩn tiếng Trung">
              <span>🔊</span> <span>Nghe đọc</span>
            </button>
          </div>

          <div class="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 relative">
            <div class="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ý nghĩa câu (Tiếng Việt):</div>
            <div id="grammar-game-meaning" class="text-base sm:text-lg font-bold text-slate-800 italic leading-snug"></div>
          </div>

          <div class="mb-5">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Sắp xếp câu Tiếng Trung:</span>
              <button id="btn-toggle-pinyin-hint" class="text-2xs font-bold text-blue-600 hover:underline cursor-pointer">👁️ Hiện Pinyin</button>
            </div>
            
            <div id="grammar-game-answer-area" class="flex flex-wrap gap-2 min-h-[64px] p-3.5 bg-red-50/40 rounded-2xl border-2 border-dashed border-red-200/90 items-center transition-all duration-300">
            </div>
          </div>

          <div class="mb-6">
            <div class="text-2xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nhấp vào từ bên dưới để chọn:</div>
            <div id="grammar-game-options-area" class="flex flex-wrap gap-2 min-h-[50px] p-2 bg-slate-50 rounded-2xl border border-slate-200/70 items-center">
            </div>
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-slate-100 gap-2">
            <div id="grammar-game-feedback" class="font-bold text-sm sm:text-base transition-all duration-300"></div>
            <div class="flex items-center gap-2 shrink-0">
              <button id="btn-check-grammar-game" class="btn btn-primary bg-red-600 hover:bg-red-700 font-bold px-6 py-2.5 rounded-xl text-white shadow-md shadow-red-200 transition cursor-pointer text-sm">Kiểm tra</button>
              <button id="btn-next-grammar-game" class="btn bg-rose-600 hover:bg-rose-700 font-bold px-6 py-2.5 rounded-xl text-white shadow-md shadow-rose-200 transition cursor-pointer text-sm hidden">Câu Tiếp Theo ➔</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grammar Edit/Create Modal -->
    <div id="grammar-edit-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto">
        <div class="px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2 font-bold text-lg">
            <span id="grammar-modal-icon">✏️</span> <span id="grammar-modal-title-text">Chỉnh Sửa Cấu Trúc Ngữ Pháp</span>
          </div>
          <button id="btn-close-grammar-edit" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <input type="hidden" id="edit-grammar-id" />

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Tên Cấu Trúc Ngữ Pháp *</label>
            <input type="text" id="edit-grammar-title" class="form-control font-bold text-red-700 text-base border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500" required placeholder="v.d. Câu với 是 (shì)" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Giải thích & Cách dùng *</label>
            <textarea id="edit-grammar-desc" class="form-control text-slate-700 text-sm border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500" rows="2" placeholder="Dùng để xác định, giới thiệu..."></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Cấp độ HSK *</label>
              <select id="edit-grammar-hsk" class="form-control font-bold text-amber-800 border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500 cursor-pointer bg-amber-50/30">
                <option value="HSK 1">HSK 1</option>
                <option value="HSK 2">HSK 2</option>
                <option value="HSK 3">HSK 3</option>
                <option value="HSK 4">HSK 4</option>
                <option value="HSK 5">HSK 5</option>
                <option value="HSK 6">HSK 6</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Công thức Cấu trúc *</label>
              <input type="text" id="edit-grammar-formula" class="form-control font-bold text-slate-800 border border-slate-200 rounded-xl px-3.5 py-2.5 w-full focus:outline-none focus:border-red-500" placeholder="v.d. A + 是 + B" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span class="flex items-center gap-1.5">
                <span>📝</span> <span>Các Ví Dụ Ứng Dụng (Dạng Văn Bản Multiline)</span>
              </span>
              <span class="text-2xs text-slate-400 font-normal">Dòng 1: Chữ Hán (Đỏ) | Dòng 2: Pinyin (Xanh) | Dòng 3: Dịch</span>
            </label>
            
            <div id="grammar-multiline-examples-editor" class="bg-slate-50/90 border border-slate-200 rounded-2xl p-4 min-h-[180px] space-y-3">
              <!-- Dynamic Multiline Example Blocks -->
            </div>

            <div class="flex justify-between items-center mt-3">
              <button type="button" id="btn-add-multiline-example-block" class="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1">
                <span>➕</span> <span>Thêm Ví Dụ Mới</span>
              </button>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button type="button" id="btn-delete-grammar-in-modal" class="px-4 py-2 rounded-full border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition cursor-pointer text-sm hidden flex items-center gap-1.5">
            <span>🗑️</span> <span>Xóa Cấu Trúc</span>
          </button>
          <div class="flex justify-end items-center gap-3 ml-auto">
            <button type="button" id="btn-cancel-grammar-edit" class="px-5 py-2 rounded-full border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition cursor-pointer text-sm">Hủy</button>
            <button type="button" id="btn-save-grammar-edit" class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 shadow-md shadow-red-200 transition cursor-pointer text-sm">
              <span>💾</span> <span id="grammar-save-btn-text">Lưu Cấu Trúc Ngữ Pháp</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mastery Rules Guide Modal -->
    <div id="grammar-mastery-guide-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 my-auto flex flex-col">
        <div class="px-6 py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2.5 font-bold text-lg">
            <span class="text-2xl">📊</span>
            <div>
              <h3 class="font-black text-lg leading-tight">Quy Tắc Đánh Giá Mức Độ Thành Thạo</h3>
              <p class="text-2xs text-red-100 font-normal">Tiêu chuẩn phân cấp & chấm điểm ngữ pháp</p>
            </div>
          </div>
          <button id="btn-close-mastery-guide" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <div class="p-6 space-y-3.5">
          <div class="flex items-center gap-3 p-3.5 bg-amber-50/90 rounded-2xl border border-amber-200">
            <div class="text-2xl shrink-0">🏆</div>
            <div>
              <div class="font-extrabold text-amber-900 text-xs flex items-center gap-1.5">Chuyên Gia (85% - 100%) <span class="text-amber-500">⭐⭐⭐⭐⭐</span></div>
              <div class="text-2xs text-amber-800 font-medium mt-0.5">Đạt tỷ lệ đúng từ 85% trở lên và hoàn thành tối thiểu 3 lượt làm bài tập.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-emerald-50/90 rounded-2xl border border-emerald-200">
            <div class="text-2xl shrink-0">✨</div>
            <div>
              <div class="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5">Thành Thạo (70% - 84%) <span class="text-emerald-500">⭐⭐⭐⭐☆</span></div>
              <div class="text-2xs text-emerald-800 font-medium mt-0.5">Đạt tỷ lệ đúng từ 70% đến 84% qua các đợt làm bài tập ví dụ.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-blue-50/90 rounded-2xl border border-blue-200">
            <div class="text-2xl shrink-0">👍</div>
            <div>
              <div class="font-extrabold text-blue-900 text-xs flex items-center gap-1.5">Đạt Yêu Cầu (50% - 69%) <span class="text-blue-500">⭐⭐⭐☆☆</span></div>
              <div class="text-2xs text-blue-800 font-medium mt-0.5">Đạt tỷ lệ đúng từ 50% trở lên. Cần luyện tập thêm để nâng cao phản xạ.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-rose-50/90 rounded-2xl border border-rose-200">
            <div class="text-2xl shrink-0">🌱</div>
            <div>
              <div class="font-extrabold text-rose-900 text-xs flex items-center gap-1.5">Mới Bắt Đầu (< 50%) <span class="text-rose-500">⭐☆☆☆☆</span></div>
              <div class="text-2xs text-rose-800 font-medium mt-0.5">Đã thực hiện bài làm nhưng tỷ lệ chính xác dưới 50%. Cần xem lại ví dụ.</div>
            </div>
          </div>

          <div class="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
            <div class="text-2xl shrink-0">⚪</div>
            <div>
              <div class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">Chưa Ôn Luyện (0%) <span class="text-slate-400">☆☆☆☆☆</span></div>
              <div class="text-2xs text-slate-500 font-medium mt-0.5">Chưa từng tham gia làm bài tập Mini-Game cho cấu trúc ngữ pháp này.</div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button type="button" id="btn-dismiss-mastery-guide" class="px-6 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-md transition cursor-pointer">Đã Hiểu</button>
        </div>
      </div>
    </div>

    <!-- Excel Template & Import Guide Modal -->
    <div id="grammar-excel-template-modal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden justify-center items-center z-50 p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 my-auto flex flex-col">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2.5 font-bold text-lg">
            <span class="text-2xl">📝</span>
            <div>
              <h3 class="font-black text-lg text-white leading-tight">Tạo & Tải Mẫu File Excel Import Ngữ Pháp</h3>
              <p class="text-2xs text-indigo-100 font-normal">Định dạng chuẩn để thêm mới hàng loạt hàng chục cấu trúc ngữ pháp</p>
            </div>
          </div>
          <button id="btn-close-excel-template-modal" class="text-white/80 hover:text-white text-xl font-bold w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition cursor-pointer">✕</button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
          <div class="p-3.5 bg-indigo-50/80 rounded-2xl border border-indigo-200 leading-relaxed text-indigo-950 font-medium">
            💡 <strong>Hướng dẫn:</strong> Bấm nút <strong>"Tải Tệp Excel Mẫu"</strong> bên dưới để tải file về máy, mở bằng <strong>Microsoft Excel</strong> hoặc <strong>Google Sheets</strong>, điền dữ liệu theo các cột hướng dẫn, sau đó quay lại ứng dụng bấm <strong>"Nhập Excel"</strong> để tự động thêm mới hàng loạt!
          </div>

          <!-- Table schema columns explanation -->
          <div>
            <h4 class="font-extrabold text-slate-800 uppercase tracking-wider text-2xs mb-2">Cấu Trúc Các Cột Trong Tệp Excel Mẫu:</h4>
            <div class="space-y-2">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 1: Tên Cấu Trúc Ngữ Pháp</span>
                  <span class="text-2xs text-rose-500 font-bold ml-1.5">* (Bắt buộc)</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Tên tiêu đề cấu trúc ngữ pháp (Tiếng Trung + Pinyin hoặc Hán Việt)</div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">Ví dụ: Câu với 比如 (bǐrú)</div>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 2: Mô Tả / Ý Nghĩa</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Giải thích ý nghĩa và cách dùng của cấu trúc</div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">Ví dụ: Dùng để đưa ra ví dụ...</div>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 3: Công Thức Cấu Trúc</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Công thức ghép câu chi tiết</div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">Ví dụ: Mệnh đề + 比如 + Danh từ</div>
              </div>

              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                <div>
                  <span class="font-black text-indigo-700 text-xs">Cột 4: Các Ví Dụ Ứng Dụng (Dạng Multiline)</span>
                  <div class="text-2xs text-slate-500 mt-0.5">Nhập nhiều dòng trực tiếp trong ô Excel. Mỗi ví dụ gồm 3 dòng liên tiếp: <code>Dòng 1: Câu Hán</code> | <code>Dòng 2: Pinyin</code> | <code>Dòng 3: Dịch Việt</code></div>
                </div>
                <div class="text-3xs font-mono bg-white px-2 py-1 rounded border border-slate-200 text-slate-600 shrink-0">1. 我是学生。<br/>wǒ shì xuésheng.<br/>Tôi là học sinh</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <button type="button" id="btn-close-template-modal-footer" class="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 transition text-xs cursor-pointer w-full sm:w-auto">Đóng</button>
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button type="button" id="btn-trigger-import-modal" class="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 border border-blue-300 font-extrabold hover:bg-blue-100 transition text-xs cursor-pointer flex items-center gap-1">
              <span>📥</span> <span>Nhập File Excel Của Bạn</span>
            </button>
            <button type="button" id="btn-download-sample-excel-now" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-200 transition text-xs cursor-pointer">
              <span>📥</span> <span>Tải Tệp Excel Mẫu (.csv)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Export Excel Button
  const btnExportExcel = container.querySelector('#btn-export-grammar-excel');
  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      exportGrammarToExcel();
    });
  }

  // Import Excel Button & File Input
  const btnImportExcel = container.querySelector('#btn-import-grammar-excel');
  const excelFileInput = container.querySelector('#grammar-excel-file-input');
  const btnDownloadTemplate = container.querySelector('#btn-download-grammar-template');

  // Excel Template Modal Elements
  const excelTemplateModal = container.querySelector('#grammar-excel-template-modal');
  const btnCloseTemplateModal = container.querySelector('#btn-close-excel-template-modal');
  const btnCloseTemplateModalFooter = container.querySelector('#btn-close-template-modal-footer');
  const btnDownloadSampleNow = container.querySelector('#btn-download-sample-excel-now');
  const btnTriggerImportModal = container.querySelector('#btn-trigger-import-modal');

  const openTemplateModal = () => {
    excelTemplateModal?.classList.remove('hidden');
    excelTemplateModal?.classList.add('flex');
  };
  const closeTemplateModal = () => {
    excelTemplateModal?.classList.add('hidden');
    excelTemplateModal?.classList.remove('flex');
  };

  if (btnDownloadTemplate) {
    btnDownloadTemplate.addEventListener('click', openTemplateModal);
  }
  if (btnCloseTemplateModal) btnCloseTemplateModal.addEventListener('click', closeTemplateModal);
  if (btnCloseTemplateModalFooter) btnCloseTemplateModalFooter.addEventListener('click', closeTemplateModal);

  if (btnDownloadSampleNow) {
    btnDownloadSampleNow.addEventListener('click', () => {
      downloadSampleGrammarExcelTemplate();
    });
  }

  if (btnTriggerImportModal && excelFileInput) {
    btnTriggerImportModal.addEventListener('click', () => {
      closeTemplateModal();
      excelFileInput.value = '';
      excelFileInput.click();
    });
  }

  if (btnImportExcel && excelFileInput) {
    btnImportExcel.addEventListener('click', () => {
      excelFileInput.value = '';
      excelFileInput.click();
    });

    excelFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        importGrammarFromExcel(file, () => {
          renderGrammarView(container);
        });
      }
    });
  }

  // Mastery Guide Modal Logic
  const masteryGuideModal = container.querySelector('#grammar-mastery-guide-modal');
  const btnOpenMasteryGuide = container.querySelector('#btn-open-mastery-guide');
  const btnCloseMasteryGuide = container.querySelector('#btn-close-mastery-guide');
  const btnDismissMasteryGuide = container.querySelector('#btn-dismiss-mastery-guide');

  const openMasteryGuideModal = () => {
    masteryGuideModal?.classList.remove('hidden');
    masteryGuideModal?.classList.add('flex');
  };
  const closeMasteryGuideModal = () => {
    masteryGuideModal?.classList.add('hidden');
    masteryGuideModal?.classList.remove('flex');
  };

  if (btnOpenMasteryGuide) btnOpenMasteryGuide.addEventListener('click', openMasteryGuideModal);
  if (btnCloseMasteryGuide) btnCloseMasteryGuide.addEventListener('click', closeMasteryGuideModal);
  if (btnDismissMasteryGuide) btnDismissMasteryGuide.addEventListener('click', closeMasteryGuideModal);

  // Edit/Create Logic
  const editModal = container.querySelector('#grammar-edit-modal');
  const modalIcon = container.querySelector('#grammar-modal-icon');
  const modalTitleText = container.querySelector('#grammar-modal-title-text');
  const saveBtnText = container.querySelector('#grammar-save-btn-text');
  const createGrammarBtn = container.querySelector('#btn-create-grammar');
  const deleteGrammarInModalBtn = container.querySelector('#btn-delete-grammar-in-modal');

  const closeEditBtn = container.querySelector('#btn-close-grammar-edit');
  const cancelEditBtn = container.querySelector('#btn-cancel-grammar-edit');
  const saveEditBtn = container.querySelector('#btn-save-grammar-edit');
  const btnAddMultilineBlock = container.querySelector('#btn-add-multiline-example-block');
  const multilineEditor = container.querySelector('#grammar-multiline-examples-editor');
  
  const editIdInput = container.querySelector('#edit-grammar-id');
  const editTitleInput = container.querySelector('#edit-grammar-title');
  const editDescInput = container.querySelector('#edit-grammar-desc');
  const editFormulaInput = container.querySelector('#edit-grammar-formula');
  const editHskSelect = container.querySelector('#edit-grammar-hsk');

  const createMultilineExampleBlock = (zh = '', py = '', vi = '', index = 1) => {
    const block = document.createElement('div');
    block.className = 'multiline-example-block bg-white p-3.5 rounded-2xl border border-slate-200/90 flex flex-col gap-1.5 relative shadow-2xs';
    block.innerHTML = `
      <div class="flex items-center justify-between text-2xs font-bold text-slate-400 mb-0.5">
        <span class="text-emerald-700 font-bold">Ví dụ #${index}</span>
        <button type="button" class="btn-remove-multiline-block text-slate-400 hover:text-red-500 font-bold text-base cursor-pointer" title="Xóa ví dụ này">&times;</button>
      </div>
      <!-- Dòng 1: Chữ Hán (Màu Đỏ) -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-400 shrink-0 select-none">${index}.</span>
        <input type="text" class="inp-ex-zh font-extrabold text-red-600 hanzi-font text-base bg-red-50/40 border border-red-200/60 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-red-500 focus:bg-white" placeholder="Chữ Hán (v.d. 我是学生。)" value="${escapeHtml(zh)}" />
      </div>
      <!-- Dòng 2: Pinyin (Màu Xanh, Font Pinyin) -->
      <div class="flex items-center gap-2 pl-5">
        <input type="text" class="inp-ex-py font-pinyin font-medium text-blue-600 text-sm bg-blue-50/40 border border-blue-200/60 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-blue-500 focus:bg-white" placeholder="Pinyin (v.d. wǒ shì xuésheng.)" value="${escapeHtml(py)}" />
      </div>
      <!-- Dòng 3: Dịch Tiếng Việt (Màu Xám) -->
      <div class="flex items-center gap-2 pl-5">
        <input type="text" class="inp-ex-vi text-slate-600 text-sm bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-slate-400 focus:bg-white" placeholder="Dịch Tiếng Việt (v.d. Tôi là học sinh)" value="${escapeHtml(vi)}" />
      </div>
    `;

    const inpHanzi = block.querySelector('.inp-ex-zh');
    const inpPinyin = block.querySelector('.inp-ex-py');

    inpHanzi.addEventListener('input', () => {
      const val = inpHanzi.value.trim();
      if (val && (!inpPinyin.value.trim() || inpPinyin.dataset.autoFilled === 'true')) {
        const autoPy = lookupPinyinForHanzi(val);
        if (autoPy) {
          inpPinyin.value = autoPy;
          inpPinyin.dataset.autoFilled = 'true';
        }
      }
    });

    block.querySelector('.btn-remove-multiline-block')?.addEventListener('click', () => {
      block.remove();
      updateMultilineBlockIndices();
    });

    return block;
  };

  const startGrammarCreate = () => {
    editIdInput.value = '';
    editTitleInput.value = '';
    editDescInput.value = '';
    editFormulaInput.value = '';
    if (editHskSelect) editHskSelect.value = 'HSK 1';

    multilineEditor.innerHTML = '';
    multilineEditor.appendChild(createMultilineExampleBlock('', '', '', 1));

    if (modalIcon) modalIcon.textContent = '➕';
    if (modalTitleText) modalTitleText.textContent = 'Tạo Mới Cấu Trúc Ngữ Pháp';
    if (saveBtnText) saveBtnText.textContent = 'Tạo Cấu Trúc Ngữ Pháp';
    if (deleteGrammarInModalBtn) deleteGrammarInModalBtn.classList.add('hidden');

    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
  };

  if (createGrammarBtn) {
    createGrammarBtn.addEventListener('click', () => {
      startGrammarCreate();
    });
  }

  const closeEditModal = () => {
    editModal?.classList.add('hidden');
    editModal?.classList.remove('flex');
  };

  if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
  if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);

  if (deleteGrammarInModalBtn) {
    deleteGrammarInModalBtn.addEventListener('click', () => {
      const gid = editIdInput.value;
      if (gid) {
        closeEditModal();
        deleteGrammarItem(gid);
      }
    });
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
      const title = editTitleInput.value.trim();
      const desc = editDescInput.value.trim();
      const formula = editFormulaInput.value.trim();
      const hskLevel = editHskSelect ? editHskSelect.value : 'HSK 1';

      if (!title) {
        alert('⚠️ Vui lòng nhập Tên Cấu Trúc Ngữ Pháp!');
        editTitleInput.focus();
        return;
      }
      if (!desc) {
        alert('⚠️ Vui lòng nhập Giải thích & Cách dùng!');
        editDescInput.focus();
        return;
      }
      if (!formula) {
        alert('⚠️ Vui lòng nhập Công thức Cấu trúc!');
        editFormulaInput.focus();
        return;
      }

      const blocks = multilineEditor.querySelectorAll('.multiline-example-block');
      const newExamples = [];

      blocks.forEach(blk => {
        const zh = blk.querySelector('.inp-ex-zh').value.trim();
        let py = blk.querySelector('.inp-ex-py').value.trim();
        let vi = blk.querySelector('.inp-ex-vi').value.trim();
        if (zh) {
          if (!py) py = lookupPinyinForHanzi(zh) || zh;
          if (vi && !vi.startsWith('(')) vi = `(${vi})`;
          newExamples.push(`${zh} | ${py} | ${vi || '(Chưa có bản dịch)'}`);
        }
      });

      const gid = editIdInput.value;
      if (gid) {
        const gIndex = grammarData.findIndex(x => x.id === gid);
        if (gIndex > -1) {
          grammarData[gIndex].title = title;
          grammarData[gIndex].desc = desc;
          grammarData[gIndex].formula = formula;
          grammarData[gIndex].hskLevel = hskLevel;
          grammarData[gIndex].examples = newExamples;

          localStorage.setItem('customGrammarData', JSON.stringify(grammarData));
          closeEditModal();
          renderGrammarView(container);
          alert(`🎉 Đã cập nhật thành công cấu trúc ngữ pháp "${title}"!`);
        }
      } else {
        const newId = 'g_' + Date.now();
        const newGrammarItem = {
          id: newId,
          title: title,
          desc: desc,
          formula: formula,
          hskLevel: hskLevel,
          examples: newExamples,
          isCustom: true
        };

        grammarData.unshift(newGrammarItem);
        localStorage.setItem('customGrammarData', JSON.stringify(grammarData));
        closeEditModal();
        renderGrammarView(container);
        alert(`🎉 Đã tạo thành công cấu trúc ngữ pháp mới "${title}"!`);
      }
    });
  }

  const startGrammarEdit = (grammarId) => {
    const gIndex = grammarData.findIndex(x => x.id === grammarId);
    const g = grammarData[gIndex];
    if (!g) return;

    if (modalIcon) modalIcon.textContent = '✏️';
    if (modalTitleText) modalTitleText.textContent = 'Chỉnh Sửa Cấu Trúc Ngữ Pháp';
    if (saveBtnText) saveBtnText.textContent = 'Lưu Cấu Trúc Ngữ Pháp';
    if (deleteGrammarInModalBtn) deleteGrammarInModalBtn.classList.remove('hidden');

    editIdInput.value = g.id;
    editTitleInput.value = g.title;
    editDescInput.value = g.desc;
    editFormulaInput.value = g.formula;
    if (editHskSelect) editHskSelect.value = g.hskLevel || getGrammarHskLevel(g, gIndex);

    multilineEditor.innerHTML = '';

    (g.examples || []).forEach((ex, idx) => {
      const parts = ex.split('|').map(s => s.trim());
      if (parts.length === 3) {
        let zh = parts[0];
        let py = parts[1];
        let vi = parts[2];
        if (vi.startsWith('(') && vi.endsWith(')')) vi = vi.slice(1, -1);
        multilineEditor.appendChild(createMultilineExampleBlock(zh, py, vi, idx + 1));
      } else {
        const match = ex.match(/^(.*?)[。？！]?\s*\((.*?)\)$/);
        if (match) {
          multilineEditor.appendChild(createMultilineExampleBlock(match[1], '', match[2], idx + 1));
        } else {
          multilineEditor.appendChild(createMultilineExampleBlock(ex, '', '', idx + 1));
        }
      }
    });

    if ((g.examples || []).length === 0) {
      multilineEditor.appendChild(createMultilineExampleBlock('', '', '', 1));
    }

    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
  };

  // Practice Config Modal Logic
  const configModal = container.querySelector('#grammar-config-modal');
  const btnOpenConfig = container.querySelector('#btn-open-grammar-config');
  const btnLaunchChallengeCard = container.querySelector('#btn-launch-challenge-card');
  const btnCloseConfig = container.querySelector('#btn-close-grammar-config');
  const btnCancelConfig = container.querySelector('#btn-cancel-grammar-config');
  const btnStartConfiguredGame = container.querySelector('#btn-start-configured-game');
  const btnSelectAllConfig = container.querySelector('#btn-config-select-all');
  const btnDeselectAllConfig = container.querySelector('#btn-config-deselect-all');
  const configSearchInput = container.querySelector('#config-search-grammar');
  const configGrammarListEl = container.querySelector('#config-grammar-list');
  const configSelectedCountEl = container.querySelector('#config-selected-count');
  const configTotalCountEl = container.querySelector('#config-total-count');
  const configCountOptions = container.querySelector('#config-count-options');

  let selectedGrammarIds = new Set(grammarData.map(g => g.id));
  let practiceOrderMode = 'random'; // 'random' | 'sequential'
  let practiceQuestionLimit = 10; // 5 | 10 | 20 | 'all'

  const updateConfigSelectedCount = () => {
    if (configSelectedCountEl) configSelectedCountEl.textContent = selectedGrammarIds.size;
    if (configTotalCountEl) configTotalCountEl.textContent = grammarData.length;
  };

  const renderConfigGrammarList = (filterTerm = '') => {
    if (!configGrammarListEl) return;
    const term = filterTerm.toLowerCase().trim();
    const filtered = grammarData.filter(g => 
      !term || g.title.toLowerCase().includes(term) || g.desc.toLowerCase().includes(term)
    );

    configGrammarListEl.innerHTML = filtered.map((g, idx) => {
      const isChecked = selectedGrammarIds.has(g.id);
      return `<label class="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/80 hover:border-red-300 transition cursor-pointer select-none">
        <input type="checkbox" class="chk-config-item text-red-600 rounded focus:ring-red-500 w-4 h-4 cursor-pointer" data-id="${g.id}" ${isChecked ? 'checked' : ''} />
        <div class="truncate text-xs font-bold text-slate-700">
          <span class="text-red-700 font-extrabold">#${idx + 1}.</span> ${escapeHtml(g.title)}
        </div>
      </label>`;
    }).join('');

    updateConfigSelectedCount();
  };

  const openConfigModal = () => {
    if (selectedGrammarIds.size === 0) {
      selectedGrammarIds = new Set(grammarData.map(g => g.id));
    }
    renderConfigGrammarList();
    configModal?.classList.remove('hidden');
    configModal?.classList.add('flex');
  };

  const closeConfigModal = () => {
    configModal?.classList.add('hidden');
    configModal?.classList.remove('flex');
  };

  if (btnOpenConfig) btnOpenConfig.addEventListener('click', openConfigModal);
  if (btnLaunchChallengeCard) btnLaunchChallengeCard.addEventListener('click', openConfigModal);
  if (btnCloseConfig) btnCloseConfig.addEventListener('click', closeConfigModal);
  if (btnCancelConfig) btnCancelConfig.addEventListener('click', closeConfigModal);

  if (btnSelectAllConfig) {
    btnSelectAllConfig.addEventListener('click', () => {
      selectedGrammarIds = new Set(grammarData.map(g => g.id));
      renderConfigGrammarList(configSearchInput?.value || '');
    });
  }

  if (btnDeselectAllConfig) {
    btnDeselectAllConfig.addEventListener('click', () => {
      selectedGrammarIds.clear();
      renderConfigGrammarList(configSearchInput?.value || '');
    });
  }

  if (configSearchInput) {
    configSearchInput.addEventListener('input', (e) => {
      renderConfigGrammarList(e.target.value);
    });
  }

  if (configGrammarListEl) {
    configGrammarListEl.addEventListener('change', (e) => {
      const chk = e.target.closest('.chk-config-item');
      if (chk) {
        const gid = chk.getAttribute('data-id');
        if (chk.checked) {
          selectedGrammarIds.add(gid);
        } else {
          selectedGrammarIds.delete(gid);
        }
        updateConfigSelectedCount();
      }
    });
  }

  if (configCountOptions) {
    configCountOptions.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-count-opt');
      if (btn) {
        configCountOptions.querySelectorAll('.btn-count-opt').forEach(b => {
          b.className = 'btn-count-opt px-4 py-2 rounded-xl border border-slate-200 bg-white font-bold text-xs text-slate-700 hover:border-red-400 transition cursor-pointer';
        });
        btn.className = 'btn-count-opt px-4 py-2 rounded-xl border-2 border-red-500 bg-red-50 font-black text-xs text-red-800 shadow-2xs cursor-pointer active-count';
        const cnt = btn.getAttribute('data-count');
        practiceQuestionLimit = cnt === 'all' ? 'all' : parseInt(cnt);
      }
    });
  }

  const modeRadios = container.querySelectorAll('input[name="practice-order-mode"]');
  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      practiceOrderMode = e.target.value;
      const lblRandom = container.querySelector('#lbl-mode-random');
      const lblSeq = container.querySelector('#lbl-mode-sequential');
      if (practiceOrderMode === 'random') {
        lblRandom?.classList.add('border-red-500', 'bg-red-50/40');
        lblRandom?.classList.remove('border-slate-200', 'bg-white');
        lblSeq?.classList.remove('border-red-500', 'bg-red-50/40');
        lblSeq?.classList.add('border-slate-200', 'bg-white');
      } else {
        lblSeq?.classList.add('border-red-500', 'bg-red-50/40');
        lblSeq?.classList.remove('border-slate-200', 'bg-white');
        lblRandom?.classList.remove('border-red-500', 'bg-red-50/40');
        lblRandom?.classList.add('border-slate-200', 'bg-white');
      }
    });
  });

  const startCustomConfiguredPractice = () => {
    if (selectedGrammarIds.size === 0) {
      alert('⚠️ Vui lòng chọn ít nhất 1 cấu trúc ngữ pháp để luyện tập!');
      return;
    }

    const selectedItems = grammarData.filter(g => selectedGrammarIds.has(g.id));
    const pool = [];

    selectedItems.forEach(g => {
      (g.examples || []).forEach(ex => {
        const parsed = parseExampleItem(ex);
        pool.push({
          grammarTitle: g.title,
          grammarId: g.id,
          ...parsed
        });
      });
    });

    if (pool.length === 0) {
      alert('⚠️ Các cấu trúc ngữ pháp đã chọn chưa có ví dụ nào!');
      return;
    }

    if (practiceOrderMode === 'random') {
      pool.sort(() => Math.random() - 0.5);
    }
    // If sequential mode: pool is already ordered by grammarData structure sequence!

    let limit = pool.length;
    if (practiceQuestionLimit !== 'all' && typeof practiceQuestionLimit === 'number') {
      limit = Math.min(practiceQuestionLimit, pool.length);
    }

    questionsPool = pool.slice(0, limit);
    gameMode = practiceOrderMode;

    currentQuestionIndex = 0;
    streakCount = 0;
    if (streakCountEl) streakCountEl.textContent = streakCount;

    closeConfigModal();
    loadQuestionAtIndex(0);
    gameModal?.classList.remove('hidden');
    gameModal?.classList.add('flex');
  };

  if (btnStartConfiguredGame) {
    btnStartConfiguredGame.addEventListener('click', startCustomConfiguredPractice);
  }

  // Game Logic & State
  const gameModal = container.querySelector('#grammar-game-modal');
  const closeGameBtn = container.querySelector('#btn-close-grammar-game');
  const meaningEl = container.querySelector('#grammar-game-meaning');
  const answerArea = container.querySelector('#grammar-game-answer-area');
  const optionsArea = container.querySelector('#grammar-game-options-area');
  const checkBtn = container.querySelector('#btn-check-grammar-game');
  const nextBtn = container.querySelector('#btn-next-grammar-game');
  const feedbackEl = container.querySelector('#grammar-game-feedback');
  const ttsBtn = container.querySelector('#btn-game-tts');
  const pinyinToggleBtn = container.querySelector('#btn-toggle-pinyin-hint');
  const streakCountEl = container.querySelector('#game-streak-count');
  const progressLabelEl = container.querySelector('#game-progress-label');
  const badgeEl = container.querySelector('#grammar-game-badge');
  const btnGlobalGame = container.querySelector('#btn-start-global-grammar-game');
  const btnLaunchGameCard = container.querySelector('#btn-launch-game-card');

  let gameMode = 'single'; // 'single' | 'global'
  let questionsPool = [];
  let currentQuestionIndex = 0;
  let streakCount = 0;
  let showPinyin = false;

  let currentTargetChinese = '';
  let currentTargetPinyin = '';
  let currentTargetMeaning = '';
  let currentAnswer = [];
  let availableWords = [];

  const speakText = (text) => {
    if (!text || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };

  const resetGameFeedback = () => {
    feedbackEl.textContent = '';
    feedbackEl.className = 'font-bold text-sm sm:text-base transition-all duration-300';
    checkBtn?.classList.remove('hidden');
    nextBtn?.classList.add('hidden');
  };

  const getPinyin = (w) => {
    if (window.pinyinPro) {
      return window.pinyinPro.pinyin(w, { toneType: 'mark' });
    }
    return '';
  };

  const renderGameWords = () => {
    answerArea.innerHTML = currentAnswer.map((word, idx) => 
      '<button class="btn-game-word-answer px-3.5 py-2 bg-red-100 text-red-800 border border-red-200/80 font-bold rounded-xl shadow-xs hover:bg-red-200 transition text-base sm:text-lg flex flex-col items-center leading-none min-w-[3rem] cursor-pointer" data-idx="' + idx + '">'
      + (showPinyin ? '<span class="text-2xs text-blue-600 font-pinyin opacity-90 mb-1">' + getPinyin(word) + '</span>' : '')
      + '<span>' + word + '</span>'
      + '</button>'
    ).join('');

    optionsArea.innerHTML = availableWords.map((word, idx) => 
      '<button class="btn-game-word-option px-3.5 py-2 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl shadow-xs hover:border-red-400 hover:text-red-600 hover:bg-red-50/50 transition text-base sm:text-lg flex flex-col items-center leading-none min-w-[3rem] cursor-pointer" data-idx="' + idx + '">'
      + (showPinyin ? '<span class="text-2xs text-blue-600 font-pinyin opacity-90 mb-1">' + getPinyin(word) + '</span>' : '')
      + '<span>' + word + '</span>'
      + '</button>'
    ).join('');
  };

  const parseExampleItem = (ex) => {
    let chinese = ex;
    let pinyin = '';
    let vietnamese = 'Không có bản dịch';

    const parts = ex.split('|').map(s => s.trim());
    if (parts.length === 3) {
      chinese = parts[0];
      pinyin = parts[1];
      vietnamese = parts[2];
    } else {
      const match = ex.match(/^(.*?)[。？！]?\s*\((.*?)\)$/);
      if (match) {
        chinese = match[1];
        vietnamese = match[2];
      } else {
        const fallbackParts = ex.split('(');
        chinese = fallbackParts[0].trim().replace(/[。？！]$/, '');
        if (fallbackParts[1]) vietnamese = fallbackParts[1].replace(')', '').trim();
      }
    }
    if (vietnamese.startsWith('(') && vietnamese.endsWith(')')) {
      vietnamese = vietnamese.slice(1, -1);
    }
    return { chinese, pinyin, vietnamese };
  };

  const loadQuestionAtIndex = (index) => {
    if (!questionsPool || questionsPool.length === 0 || index >= questionsPool.length) {
      feedbackEl.textContent = `🎉 Hoàn thành xuất sắc ${questionsPool.length} câu ví dụ! Chuỗi đúng: ${streakCount}`;
      feedbackEl.className = 'font-black text-red-600 text-base';
      checkBtn?.classList.add('hidden');
      nextBtn?.classList.add('hidden');
      return;
    }

    const q = questionsPool[index];
    currentTargetChinese = q.chinese;
    currentTargetPinyin = q.pinyin;
    currentTargetMeaning = q.vietnamese;

    if (badgeEl) badgeEl.textContent = q.grammarTitle || 'Tất cả cấu trúc';
    if (progressLabelEl) progressLabelEl.textContent = `Câu ${index + 1} / ${questionsPool.length}`;

    meaningEl.textContent = currentTargetMeaning;

    // Split sentence into characters, stripping punctuation for unscramble
    const cleanChars = currentTargetChinese.replace(/[。？！，、]/g, '').split('');
    currentAnswer = [];
    availableWords = [...cleanChars];
    availableWords.sort(() => Math.random() - 0.5);

    resetGameFeedback();
    renderGameWords();
  };

  const startGrammarGame = (grammarId) => {
    const g = grammarData.find(x => x.id === grammarId);
    if (!g || !g.examples || g.examples.length === 0) {
      alert('⚠️ Cấu trúc ngữ pháp này chưa có ví dụ để luyện tập!');
      return;
    }

    gameMode = 'single';
    questionsPool = g.examples.map(ex => {
      const parsed = parseExampleItem(ex);
      return {
        grammarId: g.id,
        grammarTitle: g.title,
        ...parsed
      };
    });
    // Shuffle pool
    questionsPool.sort(() => Math.random() - 0.5);

    currentQuestionIndex = 0;
    streakCount = 0;
    if (streakCountEl) streakCountEl.textContent = streakCount;

    loadQuestionAtIndex(0);
    gameModal.classList.remove('hidden');
    gameModal.classList.add('flex');
  };

  const startGlobalGrammarGame = () => {
    const allQuestions = [];
    grammarData.forEach(g => {
      (g.examples || []).forEach(ex => {
        const parsed = parseExampleItem(ex);
        allQuestions.push({
          grammarId: g.id,
          grammarTitle: g.title,
          ...parsed
        });
      });
    });

    if (allQuestions.length === 0) {
      alert('⚠️ Chưa có ví dụ ngữ pháp nào để luyện tập!');
      return;
    }

    gameMode = 'global';
    allQuestions.sort(() => Math.random() - 0.5);
    // Select up to 10 questions per round
    questionsPool = allQuestions.slice(0, Math.min(10, allQuestions.length));

    currentQuestionIndex = 0;
    streakCount = 0;
    if (streakCountEl) streakCountEl.textContent = streakCount;

    loadQuestionAtIndex(0);
    gameModal.classList.remove('hidden');
    gameModal.classList.add('flex');
  };

  if (btnGlobalGame) {
    btnGlobalGame.addEventListener('click', startGlobalGrammarGame);
  }
  if (btnLaunchGameCard) {
    btnLaunchGameCard.addEventListener('click', startGlobalGrammarGame);
  }

  if (pinyinToggleBtn) {
    pinyinToggleBtn.addEventListener('click', () => {
      showPinyin = !showPinyin;
      pinyinToggleBtn.textContent = showPinyin ? '🙈 Ẩn Pinyin' : '👁️ Hiện Pinyin';
      renderGameWords();
    });
  }

  if (ttsBtn) {
    ttsBtn.addEventListener('click', () => {
      speakText(currentTargetChinese);
    });
  }

  container.addEventListener('click', (e) => {
    const btnEdit = e.target.closest('.btn-grammar-edit');
    if (btnEdit) {
      const gid = btnEdit.getAttribute('data-id');
      startGrammarEdit(gid);
      return;
    }

    const btnGame = e.target.closest('.btn-grammar-game');
    if (btnGame) {
      const gid = btnGame.getAttribute('data-id');
      startGrammarGame(gid);
      return;
    }

    const btnOption = e.target.closest('.btn-game-word-option');
    if (btnOption) {
      const idx = parseInt(btnOption.getAttribute('data-idx'));
      currentAnswer.push(availableWords[idx]);
      availableWords.splice(idx, 1);
      resetGameFeedback();
      renderGameWords();
      return;
    }

    const btnAnswer = e.target.closest('.btn-game-word-answer');
    if (btnAnswer) {
      const idx = parseInt(btnAnswer.getAttribute('data-idx'));
      availableWords.push(currentAnswer[idx]);
      currentAnswer.splice(idx, 1);
      resetGameFeedback();
      renderGameWords();
      return;
    }
  });

  const updateHeaderLearnedCount = () => {
    let learnedCount = 0;
    grammarData.forEach(g => {
      const info = getGrammarMasteryInfo(g.id);
      if (info.isLearned) learnedCount++;
    });
    const learnedEl = container.querySelector('#grammar-learned-display');
    if (learnedEl) {
      learnedEl.innerHTML = `${learnedCount} <span class="text-lg text-slate-400 font-bold">/ ${grammarData.length}</span>`;
    }
  };

  closeGameBtn?.addEventListener('click', () => {
    gameModal?.classList.add('hidden');
    gameModal?.classList.remove('flex');
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    renderGrammarView(container);
  });

  checkBtn?.addEventListener('click', () => {
    const cleanTarget = currentTargetChinese.replace(/[。？！，、]/g, '');
    const userAnswer = currentAnswer.join('');
    const currentQ = questionsPool[currentQuestionIndex];
    const gId = currentQ?.grammarId;

    if (userAnswer === cleanTarget) {
      speakText(currentTargetChinese);
      streakCount++;
      if (streakCountEl) streakCountEl.textContent = streakCount;

      let currentScore = getGrammarScore() + 10;
      saveGrammarScore(currentScore);

      if (gId) {
        const map = getGrammarMasteryMap();
        if (!map[gId]) map[gId] = { correct: 0, total: 0 };
        map[gId].correct = (map[gId].correct || 0) + 1;
        map[gId].total = (map[gId].total || 0) + 1;
        saveGrammarMasteryMap(map);
      }

      const scoreEl = container.querySelector('#grammar-score-display');
      if (scoreEl) scoreEl.textContent = currentScore;
      updateHeaderLearnedCount();

      feedbackEl.textContent = '🎉 Chính xác! Tuyệt vời! (+10 điểm)';
      feedbackEl.className = 'font-black text-red-600 text-base sm:text-lg animate-bounce';

      checkBtn.classList.add('hidden');
      nextBtn?.classList.remove('hidden');
    } else {
      streakCount = 0;
      if (streakCountEl) streakCountEl.textContent = streakCount;

      if (gId) {
        const map = getGrammarMasteryMap();
        if (!map[gId]) map[gId] = { correct: 0, total: 0 };
        map[gId].total = (map[gId].total || 0) + 1;
        saveGrammarMasteryMap(map);
      }

      feedbackEl.textContent = `❌ Chưa đúng! Đáp án đúng: "${currentTargetChinese}"`;
      feedbackEl.className = 'font-bold text-red-500 text-sm';
      answerArea.style.transform = 'translateX(-8px)';
      setTimeout(() => answerArea.style.transform = 'translateX(-8px)', 100);
      setTimeout(() => answerArea.style.transform = 'translateX(8px)', 200);
      setTimeout(() => answerArea.style.transform = 'translateX(0)', 300);
    }
  });

  nextBtn?.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < questionsPool.length) {
      loadQuestionAtIndex(currentQuestionIndex);
    } else {
      const finalScore = getGrammarScore();
      feedbackEl.textContent = `🏆 Bạn đã hoàn thành vòng luyện tập với tổng điểm: ${finalScore}!`;
      feedbackEl.className = 'font-black text-red-700 text-base';
      checkBtn?.classList.add('hidden');
      nextBtn?.classList.add('hidden');
    }
  });

  let activeFilter = 'all';
  let activeHskFilter = 'all';
  const searchInput = container.querySelector('#search-grammar-input');
  const filterTabsContainer = container.querySelector('#grammar-filter-tabs');
  const hskFilterTabsContainer = container.querySelector('#grammar-hsk-filter-tabs');

  const applyCardFilters = () => {
    const term = (searchInput?.value || '').toLowerCase().trim();
    const cards = container.querySelectorAll('.grammar-card-wrapper');
    cards.forEach(card => {
      const title = card.getAttribute('data-title').toLowerCase();
      const desc = card.getAttribute('data-desc').toLowerCase();
      const status = card.getAttribute('data-status');
      const cardHsk = card.getAttribute('data-hsk') || '';

      const matchesSearch = !term || title.includes(term) || desc.includes(term);
      const matchesFilter = activeFilter === 'all' || status === activeFilter;
      const matchesHsk = activeHskFilter === 'all' || cardHsk.toUpperCase() === activeHskFilter.toUpperCase();

      if (matchesSearch && matchesFilter && matchesHsk) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  };

  if (filterTabsContainer) {
    filterTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-filter-tab');
      if (btn) {
        filterTabsContainer.querySelectorAll('.btn-filter-tab').forEach(b => {
          b.className = 'btn-filter-tab px-4 py-2 rounded-full bg-white text-red-950 font-bold border border-rose-200/90 shadow-xs hover:border-red-300 transition text-xs flex items-center gap-2 cursor-pointer whitespace-nowrap';
        });
        btn.className = 'btn-filter-tab px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-bold text-xs shadow-md shadow-red-500/30 flex items-center gap-2 cursor-pointer active-filter whitespace-nowrap';
        activeFilter = btn.getAttribute('data-filter');
        applyCardFilters();
      }
    });
  }

  if (hskFilterTabsContainer) {
    hskFilterTabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-hsk-filter-tab');
      if (btn) {
        hskFilterTabsContainer.querySelectorAll('.btn-hsk-filter-tab').forEach(b => {
          b.className = 'btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-bold bg-white text-slate-700 border border-rose-200/90 hover:border-red-300 hover:text-red-700 shadow-2xs transition-all cursor-pointer whitespace-nowrap';
        });
        btn.className = 'btn-hsk-filter-tab px-3 py-1 rounded-full text-2xs font-extrabold bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-xs cursor-pointer active-hsk-filter whitespace-nowrap transition-all';
        activeHskFilter = btn.getAttribute('data-hsk');
        applyCardFilters();
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyCardFilters);
  }
}


  // ------------------------------------------------------

// --------------------------------------------------------------------------
// HELPER FUNCTIONS & EXPORTS
// --------------------------------------------------------------------------

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getGrammarHskLevel(g, idx) {
  if (g && g.hskLevel) return g.hskLevel;
  const num = parseInt((g && g.id ? g.id : '').replace('g', '')) || (idx + 1);
  if (num <= 10) return 'HSK 1';
  if (num <= 20) return 'HSK 2';
  if (num <= 30) return 'HSK 3';
  if (num <= 40) return 'HSK 4';
  if (num <= 48) return 'HSK 5';
  return 'HSK 6';
}

function getGrammarMasteryMap() {
  try {
    const raw = localStorage.getItem('hanzo_grammar_mastery_map');
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveGrammarMasteryMap(map) {
  try {
    localStorage.setItem('hanzo_grammar_mastery_map', JSON.stringify(map));
  } catch (e) {}
}

function getGrammarMasteryInfo(gId) {
  const map = getGrammarMasteryMap();
  const data = map[gId] || { correct: 0, total: 0 };
  const total = data.total || 0;
  const correct = data.correct || 0;
  if (total === 0) {
    return { level: 0, stars: '☆☆☆☆☆', label: 'Chưa Ôn', color: 'slate', isLearned: false, status: 'unlearned', percent: 0 };
  }
  const pct = Math.round((correct / total) * 100);
  if (pct >= 85 && total >= 3) {
    return { level: 4, stars: '⭐⭐⭐⭐⭐', label: 'Chuyên Gia', color: 'amber', isLearned: true, status: 'mastered', percent: pct };
  } else if (pct >= 70) {
    return { level: 3, stars: '⭐⭐⭐⭐☆', label: 'Thành Thạo', color: 'emerald', isLearned: true, status: 'learning', percent: pct };
  } else if (pct >= 50) {
    return { level: 2, stars: '⭐⭐⭐☆☆', label: 'Đạt Yêu Cầu', color: 'blue', isLearned: true, status: 'learning', percent: pct };
  } else {
    return { level: 1, stars: '⭐☆☆☆☆', label: 'Mới Bắt Đầu', color: 'rose', isLearned: true, status: 'learning', percent: pct };
  }
}

function getGrammarScore() {
  try {
    return parseInt(localStorage.getItem('hanzo_grammar_score') || '0', 10);
  } catch (e) {
    return 0;
  }
}

function saveGrammarScore(score) {
  try {
    localStorage.setItem('hanzo_grammar_score', String(score));
  } catch (e) {}
}

function renderCard(g, idx) {
  const hskLevel = getGrammarHskLevel(g, idx);
  const mastery = getGrammarMasteryInfo(g.id);
  const examples = g.examples || [];

  const exampleItemsHtml = examples.map((ex, exIdx) => {
    const parts = ex.split('|').map(s => s.trim());
    if (parts.length === 3) {
      return `<div class="bg-white/90 p-3 rounded-2xl border border-rose-100/80 shadow-2xs">
        <div class="font-extrabold text-red-600 text-base leading-snug hanzi-font flex items-center justify-between">
          <span>${escapeHtml(parts[0])}</span>
          <button class="btn-speech-ex text-xs opacity-70 hover:opacity-100 transition cursor-pointer p-1" title="Phát âm" data-speech="${escapeHtml(parts[0])}">🔊</button>
        </div>
        <div class="text-xs font-pinyin text-blue-600 font-medium mt-0.5">${escapeHtml(parts[1])}</div>
        <div class="text-2xs text-slate-600 mt-1 font-semibold">${escapeHtml(parts[2])}</div>
      </div>`;
    } else {
      return `<div class="bg-white/90 p-3 rounded-2xl border border-rose-100/80 shadow-2xs text-xs font-medium text-slate-700">${escapeHtml(ex)}</div>`;
    }
  }).join('');

  return `
    <div class="grammar-card-wrapper glass-panel rounded-3xl p-5 border border-rose-200/80 bg-white/80 shadow-sm hover:shadow-md transition flex flex-col justify-between"
         data-id="${g.id}"
         data-title="${escapeHtml(g.title)}"
         data-desc="${escapeHtml(g.desc)}"
         data-hsk="${hskLevel}"
         data-status="${mastery.status}">
      <div>
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-red-100 text-red-800 uppercase tracking-wider">${hskLevel}</span>
            <span class="text-2xs font-extrabold px-2 py-0.5 rounded-full bg-${mastery.color}-100 text-${mastery.color}-800 border border-${mastery.color}-200">${mastery.label} (${mastery.percent}%)</span>
          </div>
          <div class="text-xs font-bold text-amber-500 tracking-widest">${mastery.stars}</div>
        </div>

        <h3 class="font-black text-lg text-red-950 mb-1 leading-tight">
          <span class="text-red-600 font-extrabold mr-1">#${idx + 1}.</span> ${escapeHtml(g.title)}
        </h3>
        <p class="text-xs text-slate-600 font-medium mb-3 leading-relaxed">${escapeHtml(g.desc)}</p>

        <div class="bg-gradient-to-r from-red-50 to-rose-50 p-3 rounded-2xl border border-red-200/60 mb-4">
          <div class="text-3xs font-black uppercase tracking-wider text-red-800/70 mb-0.5">Công Thức Cấu Trúc</div>
          <div class="text-xs font-black text-red-900 font-mono">${escapeHtml(g.formula)}</div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="text-3xs font-black uppercase tracking-wider text-slate-400">Ví Dụ Ứng Dụng (${examples.length})</div>
          ${exampleItemsHtml}
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-rose-100 gap-2 mt-auto">
        <button class="btn-grammar-game text-xs font-extrabold px-4 py-2 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/25 active:scale-95 transition cursor-pointer flex items-center gap-1.5" data-id="${g.id}">
          <span>🎮</span> <span>Luyện Tập</span>
        </button>
        <button class="btn-grammar-edit text-xs font-bold px-3.5 py-1.5 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-red-300 hover:text-red-700 transition cursor-pointer flex items-center gap-1" data-id="${g.id}">
          <span>✏️</span> <span>Sửa</span>
        </button>
      </div>
    </div>
  `;
}

function updateMultilineBlockIndices() {
  const container = document.querySelector('#grammar-multiline-examples-editor');
  if (!container) return;
  const blocks = container.querySelectorAll('.multiline-example-block');
  blocks.forEach((blk, idx) => {
    const titleEl = blk.querySelector('.text-emerald-700');
    if (titleEl) titleEl.textContent = `Ví dụ #${idx + 1}`;
    const numEl = blk.querySelector('.select-none');
    if (numEl) numEl.textContent = `${idx + 1}.`;
  });
}

function deleteGrammarItem(gid) {
  const data = getStoredGrammarData();
  const idx = data.findIndex(x => x.id === gid);
  if (idx > -1) {
    const title = data[idx].title;
    if (confirm(`⚠️ Bạn có chắc chắn muốn xóa cấu trúc ngữ pháp "${title}" không?`)) {
      data.splice(idx, 1);
      saveStoredGrammarData(data);
      const container = document.querySelector('#app') || document.body;
      renderGrammarView(container);
      alert(`🗑️ Đã xóa cấu trúc ngữ pháp "${title}"!`);
    }
  }
}

function exportGrammarToExcel() {
  const data = getStoredGrammarData();
  let csvContent = '\uFEFF';
  csvContent += 'Tên Cấu Trúc Ngữ Pháp,Mô Tả / Ý Nghĩa,Công Thức Cấu Trúc,Các Ví Dụ Ứng Dụng\n';

  data.forEach(g => {
    const title = `"${(g.title || '').replace(/"/g, '""')}"`;
    const desc = `"${(g.desc || '').replace(/"/g, '""')}"`;
    const formula = `"${(g.formula || '').replace(/"/g, '""')}"`;
    const examples = `"${(g.examples || []).join('\n').replace(/"/g, '""')}"`;
    csvContent += `${title},${desc},${formula},${examples}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Hanzo_Grammar_Export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importGrammarFromExcel(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('⚠️ Tệp Excel/CSV rỗng hoặc không đúng định dạng!');
        return;
      }
      
      const currentData = getStoredGrammarData();
      let importedCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = [];
        let inQuote = false;
        let field = '';
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuote = !inQuote;
          } else if (char === ',' && !inQuote) {
            cols.push(field.trim());
            field = '';
          } else {
            field += char;
          }
        }
        cols.push(field.trim());

        if (cols.length >= 1 && cols[0]) {
          const title = cols[0].replace(/^"|"$/g, '').trim();
          const desc = (cols[1] || '').replace(/^"|"$/g, '').trim();
          const formula = (cols[2] || '').replace(/^"|"$/g, '').trim();
          const exRaw = (cols[3] || '').replace(/^"|"$/g, '').trim();
          const examples = exRaw ? exRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

          if (title) {
            currentData.unshift({
              id: 'g_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              title,
              desc: desc || 'Cấu trúc ngữ pháp bổ sung',
              formula: formula || title,
              examples,
              isCustom: true
            });
            importedCount++;
          }
        }
      }

      if (importedCount > 0) {
        saveStoredGrammarData(currentData);
        alert(`🎉 Đã nhập thành công ${importedCount} cấu trúc ngữ pháp từ tệp Excel!`);
        if (callback) callback();
      } else {
        alert('⚠️ Không tìm thấy cấu trúc hợp lệ trong tệp Excel!');
      }
    } catch (err) {
      alert('❌ Lỗi khi đọc tệp Excel: ' + err.message);
    }
  };
  reader.readAsText(file, 'UTF-8');
}

function downloadSampleGrammarExcelTemplate() {
  let csv = '\uFEFF';
  csv += 'Tên Cấu Trúc Ngữ Pháp,Mô Tả / Ý Nghĩa,Công Thức Cấu Trúc,Các Ví Dụ Ứng Dụng\n';
  csv += '"Câu với 是 (shì)","Dùng để xác định, giới thiệu người hoặc sự vật.","A + 是 + B","我是学生。 | wǒ shì xuésheng. | (Tôi là học sinh)\n这是我的书。 | zhè shì wǒ de shū. | (Đây là sách của tôi)"\n';
  csv += '"Phủ định với 不 (bù)","Dùng để phủ định hành động, trạng thái hoặc thói quen.","不 + Động từ/Tính từ","我不吃辣。 | wǒ bù chī là. | (Tôi không ăn cay)\n他不高。 | tā bù gāo. | (Anh ấy không cao)"\n';

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Hanzo_Grammar_Template_Mau.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
