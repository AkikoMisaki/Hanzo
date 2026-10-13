const fs = require('fs');
const path = require('path');

const newGrammarData = `const grammarData = [
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
];`;

const updateFile = (filePath, exportPrefix = false) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the old grammarData array with the new one
  const pattern = /(?:export\s+)?const\s+grammarData\s*=\s*\[[\s\S]*?\];/;
  const targetPrefix = exportPrefix ? 'export ' : '';
  
  if (pattern.test(content)) {
    content = content.replace(pattern, targetPrefix + newGrammarData);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`Could not find grammarData in ${filePath}`);
  }
};

updateFile(path.join(__dirname, 'js/views/grammarView.js'), true);
updateFile(path.join(__dirname, 'js/bundle.js'), false);
