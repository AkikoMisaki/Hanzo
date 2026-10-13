const fs = require('fs');
const bundlePath = 'c:/Users/pc/.gemini/antigravity/scratch/dctHanyu/js/bundle.js';
let content = fs.readFileSync(bundlePath, 'utf8');

const examplesData = {
  g51: ["我是昨天来的。 | wǒ shì zuótiān lái de. | (Tôi đã đến vào ngày hôm qua)", "他是在北京出生的。 | tā shì zài běijīng chūshēng de. | (Anh ấy sinh ra ở Bắc Kinh)", "我们是坐火车去的。 | wǒmen shì zuò huǒchē qù de. | (Chúng tôi đi bằng tàu hỏa)"],
  g52: ["你在做什么呢？ | nǐ zài zuò shénme ne? | (Bạn đang làm gì thế?)", "我的书呢？ | wǒ de shū ne? | (Sách của tôi đâu rồi?)", "外面还下雨呢。 | wàimiàn hái xià yǔ ne. | (Bên ngoài trời vẫn đang mưa đấy)"],
  g53: ["我们走吧。 | wǒmen zǒu ba. | (Chúng ta đi thôi)", "你是越南人吧？ | nǐ shì yuènán rén ba? | (Bạn là người Việt Nam phải không?)", "这样不好吧。 | zhèyàng bù hǎo ba. | (Như vậy không tốt đâu)"],
  g54: ["你喝茶还是喝咖啡？ | nǐ hē chá háishì hē kāfēi? | (Bạn uống trà hay uống cà phê?)", "我们今天去还是明天去？ | wǒmen jīntiān qù háishì míngtiān qù? | (Chúng ta đi hôm nay hay ngày mai?)", "还是你去吧。 | háishì nǐ qù ba. | (Hay là bạn đi đi)"],
  g55: ["我喝茶或者咖啡。 | wǒ hē chá huòzhě kāfēi. | (Tôi uống trà hoặc cà phê)", "星期六或者星期天都可以。 | xīngqīliù huòzhě xīngqītiān dōu kěyǐ. | (Thứ bảy hoặc chủ nhật đều được)", "你可以坐公交车或者打车。 | nǐ kěyǐ zuò gōngjiāochē huòzhě dǎchē. | (Bạn có thể đi xe buýt hoặc bắt taxi)"],
  g56: ["我也是学生。 | wǒ yě shì xuésheng. | (Tôi cũng là học sinh)", "他也不喜欢吃辣。 | tā yě bù xǐhuan chī là. | (Anh ấy cũng không thích ăn cay)", "昨天很冷，今天也很冷。 | zuótiān hěn lěng, jīntiān yě hěn lěng. | (Hôm qua rất lạnh, hôm nay cũng rất lạnh)"],
  g57: ["我们都是中国人。 | wǒmen dōu shì zhōngguó rén. | (Chúng tôi đều là người Trung Quốc)", "这些书我都看过了。 | zhèxiē shū wǒ dōu kàn guò le. | (Những cuốn sách này tôi đều đã đọc qua)", "大家都来了。 | dàjiā dōu lái le. | (Mọi người đều đã đến)"],
  g58: ["他还在睡觉。 | tā hái zài shuìjiào. | (Anh ấy vẫn đang ngủ)", "我还有一个问题。 | wǒ hái yǒu yí gè wèntí. | (Tôi còn một câu hỏi nữa)", "昨天下雨，今天还在下。 | zuótiān xià yǔ, jīntiān hái zài xià. | (Hôm qua mưa, hôm nay vẫn đang mưa)"],
  g59: ["欢迎下次再来。 | huānyíng xià cì zài lái. | (Hoan nghênh lần sau lại đến)", "我明天再去。 | wǒ míngtiān zài qù. | (Ngày mai tôi sẽ lại đi)", "请再说一遍。 | qǐng zài shuō yí biàn. | (Vui lòng nói lại một lần nữa)"],
  g60: ["他昨天来了，今天又来了。 | tā zuótiān lái le, jīntiān yòu lái le. | (Hôm qua anh ấy đã đến, hôm nay lại đến nữa)", "你怎么又迟到了？ | nǐ zěnme yòu chídào le? | (Sao bạn lại đến muộn nữa rồi?)", "这是一个又大又红的苹果。 | zhè shì yí gè yòu dà yòu hóng de píngguǒ. | (Đây là một quả táo vừa to vừa đỏ)"],
  g61: ["我马上就来。 | wǒ mǎshàng jiù lái. | (Tôi đến ngay đây)", "他八点就起床了。 | tā bā diǎn jiù qǐchuáng le. | (Anh ấy 8 giờ đã dậy rồi)", "如果下雨，我们就不去了。 | rúguǒ xià yǔ, wǒmen jiù bú qù le. | (Nếu trời mưa, chúng tôi sẽ không đi nữa)"],
  g62: ["他十点才起床。 | tā shí diǎn cái qǐchuáng. | (Anh ấy 10 giờ mới dậy)", "只有努力学习，才能考上大学。 | zhǐyǒu nǔlì xuéxí, cái néng kǎo shàng dàxué. | (Chỉ có nỗ lực học tập mới có thể thi đỗ đại học)", "我才不信呢！ | wǒ cái bú xìn ne! | (Tôi mới không tin đâu!)"],
  g63: ["我已经吃过饭了。 | wǒ yǐjīng chī guò fàn le. | (Tôi đã ăn cơm rồi)", "他已经回家了。 | tā yǐjīng huí jiā le. | (Anh ấy đã về nhà rồi)", "比赛已经开始了。 | bǐsài yǐjīng kāishǐ le. | (Trận đấu đã bắt đầu rồi)"],
  g64: ["我还没吃饭呢。 | wǒ hái méi chī fàn ne. | (Tôi vẫn chưa ăn cơm)", "电影还没开始呢。 | diànyǐng hái méi kāishǐ ne. | (Bộ phim vẫn chưa bắt đầu)", "他还没下班呢。 | tā hái méi xiàbān ne. | (Anh ấy vẫn chưa tan làm)"],
  g65: ["我刚买了一本书。 | wǒ gāng mǎi le yì běn shū. | (Tôi vừa mua một quyển sách)", "他刚走。 | tā gāng zǒu. | (Anh ấy vừa đi)", "我们刚认识。 | wǒmen gāng rènshi. | (Chúng tôi vừa mới quen nhau)"],
  g66: ["你刚才去哪儿了？ | nǐ gāngcái qù nǎr le? | (Vừa nãy bạn đi đâu thế?)", "刚才有人找你。 | gāngcái yǒu rén zhǎo nǐ. | (Vừa nãy có người tìm bạn)", "刚才雨下得很大。 | gāngcái yǔ xià de hěn dà. | (Vừa nãy mưa rất to)"],
  g67: ["他一直在努力。 | tā yìzhí zài nǔlì. | (Anh ấy luôn luôn nỗ lực)", "这两天一直下雨。 | zhè liǎng tiān yìzhí xià yǔ. | (Hai ngày nay mưa liên tục)", "我一直住在这里。 | wǒ yìzhí zhù zài zhèlǐ. | (Tôi luôn sống ở đây)"],
  g68: ["从早上到晚上 | cóng zǎoshang dào wǎnshang | (Từ sáng đến tối)", "从一到十 | cóng yī dào shí | (Từ một đến mười)", "从北京到上海要多久？ | cóng běijīng dào shànghǎi yào duō jiǔ? | (Từ Bắc Kinh đến Thượng Hải mất bao lâu?)"],
  g69: ["我家离学校很近。 | wǒ jiā lí xuéxiào hěn jìn. | (Nhà tôi cách trường rất gần)", "这里离火车站有多远？ | zhèlǐ lí huǒchēzhàn yǒu duō yuǎn? | (Ở đây cách ga tàu bao xa?)", "离新年还有五天。 | lí xīnnián hái yǒu wǔ tiān. | (Cách năm mới còn năm ngày nữa)"],
  g70: ["往前走。 | wǎng qián zǒu. | (Đi về phía trước)", "往左拐。 | wǎng zuǒ guǎi. | (Rẽ về bên trái)", "这个班开往北京。 | zhège bān kāi wǎng běijīng. | (Chuyến xe này hướng đi Bắc Kinh)"],
  g71: ["向你学习。 | xiàng nǐ xuéxí. | (Học tập bạn)", "向前看。 | xiàng qián kàn. | (Nhìn về phía trước)", "我们要向他表示感谢。 | wǒmen yào xiàng tā biǎoshì gǎnxiè. | (Chúng ta phải bày tỏ lòng biết ơn đối với anh ấy)"],
  g72: ["他从中国来。 | tā cóng zhōngguó lái. | (Anh ấy đến từ Trung Quốc)", "我们从明天开始放假。 | wǒmen cóng míngtiān kāishǐ fàngjià. | (Chúng ta bắt đầu nghỉ lễ từ ngày mai)", "太阳从东方升起。 | tàiyáng cóng dōngfāng shēng qǐ. | (Mặt trời mọc từ hướng Đông)"],
  g73: ["跑步对身体很好。 | pǎobù duì shēntǐ hěn hǎo. | (Chạy bộ rất tốt cho cơ thể)", "他对我笑了一下。 | tā duì wǒ xiào le yí xià. | (Anh ấy mỉm cười với tôi một cái)", "这个药对感冒有效。 | zhège yào duì gǎnmào yǒuxiào. | (Thuốc này có hiệu quả với bệnh cảm)"],
  g74: ["我想跟你聊天。 | wǒ xiǎng gēn nǐ liáotiān. | (Tôi muốn nói chuyện với bạn)", "咖啡和茶，你喜欢哪个？ | kāfēi hé chá, nǐ xǐhuan nǎge? | (Cà phê và trà, bạn thích cái nào?)", "我和家人去旅行。 | wǒ hé jiārén qù lǚxíng. | (Tôi và người nhà đi du lịch)"],
  g75: ["为了学好汉语，他每天都练习。 | wèi le xuéhǎo hànyǔ, tā měitiān dōu liànxí. | (Để học tốt tiếng Trung, anh ấy luyện tập mỗi ngày)", "这是为了你好。 | zhè shì wèi le nǐ hǎo. | (Điều này là tốt cho bạn thôi)", "为了这个目标，我们必须努力。 | wèi le zhège mùbiāo, wǒmen bìxū nǔlì. | (Vì mục tiêu này, chúng ta bắt buộc phải nỗ lực)"],
  g76: ["这是一本关于中国历史的书。 | zhè shì yì běn guānyú zhōngguó lǐshǐ de shū. | (Đây là một cuốn sách về lịch sử Trung Quốc)", "关于这个问题，我们还要讨论。 | guānyú zhège wèntí, wǒmen hái yào tǎolùn. | (Về vấn đề này, chúng ta còn phải thảo luận)", "关于他的事，我不太了解。 | guānyú tā de shì, wǒ bú tài liǎojiě. | (Về chuyện của anh ấy, tôi không rành lắm)"],
  g77: ["这个问题比较难。 | zhège wèntí bǐjiào nán. | (Vấn đề này khá khó)", "我比较喜欢吃苹果。 | wǒ bǐjiào xǐhuan chī píngguǒ. | (Tôi khá thích ăn táo)", "今天天气比较冷。 | jīntiān tiānqì bǐjiào lěng. | (Thời tiết hôm nay tương đối lạnh)"],
  g78: ["这件衣服更好看。 | zhè jiàn yīfu gèng hǎokàn. | (Bộ quần áo này càng đẹp hơn)", "我想学得更好。 | wǒ xiǎng xué de gèng hǎo. | (Tôi muốn học tốt hơn nữa)", "没有最好，只有更好。 | méiyǒu zuì hǎo, zhǐyǒu gèng hǎo. | (Không có tốt nhất, chỉ có tốt hơn)"],
  g79: ["我们的生活会更加美好。 | wǒmen de shēnghuó huì gèngjiā měihǎo. | (Cuộc sống của chúng ta sẽ càng thêm tươi đẹp)", "比赛变得更加激烈。 | bǐsài biàn de gèngjiā jīliè. | (Trận đấu trở nên gay cấn hơn)", "大家要更加努力。 | dàjiā yào gèngjiā nǔlì. | (Mọi người phải cố gắng hơn nữa)"],
  g80: ["今天有点儿冷。 | jīntiān yǒu diǎnr lěng. | (Hôm nay hơi lạnh)", "我觉得有点儿累。 | wǒ juéde yǒu diǎnr lèi. | (Tôi cảm thấy hơi mệt)", "这个菜有点儿辣。 | zhège cài yǒu diǎnr là. | (Món ăn này hơi cay)"],
  g81: ["请说慢一点儿。 | qǐng shuō màn yì diǎnr. | (Vui lòng nói chậm một chút)", "我想喝一点儿水。 | wǒ xiǎng hē yì diǎnr shuǐ. | (Tôi muốn uống một chút nước)", "便宜一点儿吧。 | piányi yì diǎnr ba. | (Rẻ một chút đi)"],
  g82: ["这是多么美丽的花啊！ | zhè shì duōme měilì de huā a! | (Đây là đóa hoa xinh đẹp biết bao!)", "时间过得多么快！ | shíjiān guò de duōme kuài! | (Thời gian trôi qua thật là nhanh!)", "多么好的天气！ | duōme hǎo de tiānqì! | (Thời tiết đẹp biết bao!)"],
  g83: ["你怎么这么高兴？ | nǐ zěnme zhème gāoxìng? | (Sao bạn lại vui như thế này?)", "不要那么生气。 | bú yào nàme shēngqì. | (Đừng có tức giận như thế kia)", "这本书那么厚！ | zhè běn shū nàme hòu! | (Quyển sách này dày thế!)"],
  g84: ["我不太喜欢吃甜食。 | wǒ bú tài xǐhuan chī tiánshí. | (Tôi không thích ăn đồ ngọt lắm)", "他的汉语不太好。 | tā de hànyǔ bú tài hǎo. | (Tiếng Trung của anh ấy không tốt lắm)", "这个电影不太好看。 | zhège diànyǐng bú tài hǎokàn. | (Bộ phim này không hay lắm)"],
  g85: ["我不怎么看电视。 | wǒ bù zěnme kàn diànshì. | (Tôi không mấy khi xem TV)", "这个菜不怎么好吃。 | zhège cài bù zěnme hǎochī. | (Món ăn này không ngon lắm)", "他今天不怎么说话。 | tā jīntiān bù zěnme shuōhuà. | (Anh ấy hôm nay không nói gì mấy)"],
  g86: ["我们的想法差不多。 | wǒmen de xiǎngfǎ chàbuduō. | (Suy nghĩ của chúng tôi xấp xỉ nhau)", "我差不多做完了。 | wǒ chàbuduō zuò wán le. | (Tôi gần như đã làm xong)", "这两本书差不多一样。 | zhè liǎng běn shū chàbuduō yíyàng. | (Hai quyển sách này gần như giống nhau)"],
  g87: ["我几乎忘了。 | wǒ jīhū wàng le. | (Tôi hầu như đã quên mất)", "几乎所有人都同意了。 | jīhū suǒyǒu rén dōu tóngyì le. | (Hầu như tất cả mọi người đều đồng ý)", "房间里几乎没有声音。 | fángjiān lǐ jīhū méiyǒu shēngyīn. | (Trong phòng hầu như không có tiếng động)"],
  g88: ["我只会说一点儿汉语。 | wǒ zhǐ huì shuō yì diǎnr hànyǔ. | (Tôi chỉ biết nói một chút tiếng Trung)", "这里只有我一个人。 | zhèlǐ zhǐyǒu wǒ yí gè rén. | (Ở đây chỉ có một mình tôi)", "我只想休息。 | wǒ zhǐ xiǎng xiūxi. | (Tôi chỉ muốn nghỉ ngơi)"],
  g89: ["只有你才能帮我。 | zhǐyǒu nǐ cái néng bāng wǒ. | (Chỉ có bạn mới có thể giúp tôi)", "只有多练习，才能学好。 | zhǐyǒu duō liànxí, cái néng xuéhǎo. | (Chỉ có luyện tập nhiều mới có thể học tốt)", "只有周末，我才有时间。 | zhǐyǒu zhōumò, wǒ cái yǒu shíjiān. | (Chỉ có cuối tuần tôi mới có thời gian)"],
  g90: ["只要你喜欢，我就买给你。 | zhǐyào nǐ xǐhuan, wǒ jiù mǎi gěi nǐ. | (Chỉ cần bạn thích thì tôi sẽ mua cho bạn)", "只要努力，就一定会成功。 | zhǐyào nǔlì, jiù yídìng huì chénggōng. | (Chỉ cần nỗ lực thì nhất định sẽ thành công)", "只要明天不下雨，我们就去。 | zhǐyào míngtiān bú xià yǔ, wǒmen jiù qù. | (Chỉ cần ngày mai không mưa thì chúng ta sẽ đi)"],
  g91: ["他不但聪明，而且很努力。 | tā búdàn cōngmíng, érqiě hěn nǔlì. | (Anh ấy không những thông minh mà còn rất nỗ lực)", "这个手机不但便宜，而且好用。 | zhège shǒujī búdàn piányi, érqiě hǎoyòng. | (Chiếc điện thoại này không những rẻ mà còn dễ dùng)", "她不但会唱歌，而且会跳舞。 | tā búdàn huì chànggē, érqiě huì tiàowǔ. | (Cô ấy không những biết hát mà còn biết nhảy)"],
  g92: ["他不仅会英语，还会法语。 | tā bùjǐn huì yīngyǔ, hái huì fǎyǔ. | (Anh ấy không chỉ biết tiếng Anh mà còn biết tiếng Pháp)", "运动不仅对身体好，也能让人快乐。 | yùndòng bùjǐn duì shēntǐ hǎo, yě néng ràng rén kuàilè. | (Vận động không chỉ tốt cho sức khỏe mà còn làm con người vui vẻ)", "我不仅认识他，还是他的朋友。 | wǒ bùjǐn rènshi tā, háishì tā de péngyou. | (Tôi không chỉ quen anh ấy mà còn là bạn của anh ấy)"],
  g93: ["这件衣服既便宜又好看。 | zhè jiàn yīfu jì piányi yòu hǎokàn. | (Bộ quần áo này vừa rẻ vừa đẹp)", "这项工作既需要耐心又需要细心。 | zhè xiàng gōngzuò jì xūyào nàixīn yòu xūyào xìxīn. | (Công việc này vừa cần kiên nhẫn lại vừa cần tỉ mỉ)", "他既是我的老师，又是我的朋友。 | tā jì shì wǒ de lǎoshī, yòu shì wǒ de péngyou. | (Anh ấy vừa là thầy giáo của tôi vừa là bạn của tôi)"],
  g94: ["这不是我的错，而是他的错。 | zhè bú shì wǒ de cuò, ér shì tā de cuò. | (Đây không phải là lỗi của tôi, mà là lỗi của anh ấy)", "问题不是没有钱，而是没有时间。 | wèntí bú shì méiyǒu qián, ér shì méiyǒu shíjiān. | (Vấn đề không phải là không có tiền mà là không có thời gian)", "我不是不喜欢，而是吃不下了。 | wǒ bú shì bù xǐhuan, ér shì chī bu xià le. | (Tôi không phải là không thích mà là ăn không nổi nữa)"],
  g95: ["一方面我想去旅行，另一方面我没有钱。 | yì fāngmiàn wǒ xiǎng qù lǚxíng, lìng yì fāngmiàn wǒ méiyǒu qián. | (Một mặt tôi muốn đi du lịch, mặt khác tôi lại không có tiền)", "电脑一方面带来了方便，另一方面也带来了问题。 | diànnǎo yì fāngmiàn dài lái le fāngbiàn, lìng yì fāngmiàn yě dài lái le wèntí. | (Máy tính một mặt mang lại sự tiện lợi, mặt khác cũng mang đến rắc rối)", "这份工作一方面工资高，另一方面压力大。 | zhè fèn gōngzuò yì fāngmiàn gōngzī gāo, lìng yì fāngmiàn yālì dà. | (Công việc này một mặt lương cao, mặt khác áp lực lớn)"],
  g96: ["即使下大雨，我也要去。 | jíshǐ xià dà yǔ, wǒ yě yào qù. | (Cho dù trời mưa to, tôi cũng phải đi)", "即使很困难，我也不会放弃。 | jíshǐ hěn kùnnán, wǒ yě bú huì fàngqì. | (Cho dù rất khó khăn, tôi cũng sẽ không từ bỏ)", "即使你说了，他也不一定相信。 | jíshǐ nǐ shuō le, tā yě bù yídìng xiāngxìn. | (Cho dù bạn có nói thì anh ấy cũng chưa chắc đã tin)"],
  g97: ["无论天气好坏，他都去跑步。 | wúlùn tiānqì hǎo huài, tā dōu qù pǎobù. | (Bất kể thời tiết tốt xấu, anh ấy đều đi chạy bộ)", "无论发生什么，我都会支持你。 | wúlùn fāshēng shénme, wǒ dōu huì zhīchí nǐ. | (Bất kể xảy ra chuyện gì, tôi đều sẽ ủng hộ bạn)", "无论多忙，都要按时吃饭。 | wúlùn duō máng, dōu yào ànshí chīfàn. | (Bất kể bận thế nào đều phải ăn uống đúng giờ)"],
  g98: ["不管别人怎么说，我都不管。 | bùguǎn biérén zěnme shuō, wǒ dōu bùguǎn. | (Bất kể người khác nói thế nào, tôi cũng không quan tâm)", "不管多远，我都会去接你。 | bùguǎn duō yuǎn, wǒ dōu huì qù jiē nǐ. | (Bất kể bao xa, tôi cũng sẽ đến đón bạn)", "不管你同不同意，我都要做。 | bùguǎn nǐ tóng bù tóngyì, wǒ dōu yào zuò. | (Bất kể bạn có đồng ý hay không, tôi đều sẽ làm)"],
  g99: ["既然你不想去，就别去了。 | jìrán nǐ bù xiǎng qù, jiù bié qù le. | (Đã không muốn đi thì đừng đi nữa)", "既然答应了，就要做到。 | jìrán dāyìng le, jiù yào zuòdào. | (Đã hứa rồi thì phải làm được)", "既然大家都同意，我们就这么定了吧。 | jìrán dàjiā dōu tóngyì, wǒmen jiù zhème dìng le ba. | (Đã mọi người đều đồng ý thì chúng ta cứ quyết định vậy đi)"],
  g100: ["由于天气原因，航班被取消了，因此我们只能坐火车。 | yóuyú tiānqì yuányīn, hángbān bèi qǔxiāo le. yīncǐ wǒmen zhǐ néng zuò huǒchē. | (Do nguyên nhân thời tiết nên chuyến bay bị hủy, vì vậy chúng tôi chỉ có thể đi tàu hỏa)", "由于工作太忙他生病了，因此必须休息。 | yóuyú gōngzuò tài máng tā shēngbìng le, yīncǐ bìxū xiūxi. | (Do công việc quá bận nên anh ấy đã ngã bệnh, vì vậy bắt buộc phải nghỉ ngơi)", "由于他准备得很充分，因此顺利通过了考试。 | yóuyú tā zhǔnbèi de hěn chōngfèn, yīncǐ shùnlì tōngguò le kǎoshì. | (Do anh ấy chuẩn bị rất đầy đủ nên đã thuận lợi vượt qua kỳ thi)"]
};

// We will update the defaultGrammarData block by regex matching the ids
Object.keys(examplesData).forEach(gid => {
  const replacementExamples = JSON.stringify(examplesData[gid]);
  // Use regex to match the item with that id, e.g. { id: 'g51', ... examples: [] }
  const regex = new RegExp(\`(\\{ id: '\${gid}',.*?examples: )(\\[\\])(\\s*\\})\`);
  content = content.replace(regex, \`\$1\${replacementExamples}\$3\`);
});

// Also add a snippet to push these examples to localStorage if empty
const updateLocalStorageSnippet = \`
  // Force update examples if user had old empty arrays in local storage
  defaultGrammarData.forEach(def => {
    let localDef = grammarData.find(g => g.id === def.id);
    if (localDef && localDef.examples.length === 0 && def.examples.length > 0) {
      localDef.examples = [...def.examples];
      changed = true;
    }
  });
\`;

content = content.replace(/if \\(changed\\) \\{/, updateLocalStorageSnippet + '\\n    if (changed) {');

fs.writeFileSync(bundlePath, content, 'utf8');
console.log('Successfully updated 150 examples!');
