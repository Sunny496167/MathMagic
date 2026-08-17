import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { resolveImageUrl } from "@/lib/utils";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BlogSection {
  heading: string;
  body: string;
}

interface Blog {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  imageUri: string;
  excerpt: string;
  authorName: string;
  authorAvatar: string;
  dropCapLetter: string;
  firstParagraphRemainder: string;
  sections: BlogSection[];
  pullQuote: string;
  shopCategory: string;
}

const RICH_PREMIUM_BLOGS: Blog[] = [
  {
    id: "1",
    title: "Symphony of Threads: The Rich Heritage of Banarasi Sarees",
    category: "Heritage Textiles",
    date: "June 12, 2026",
    readTime: "5 min read",
    imageUri: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    excerpt: "Explore the centuries-old history of Banarasi weavers, their intricate gold brocades, and the exquisite craftsmanship...",
    authorName: "Ananya Iyer",
    authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
    dropCapLetter: "T",
    firstParagraphRemainder: "he Banarasi saree represents the pinnacle of Indian textile art. Historically, these sarees were crafted using pure gold and silver threads (Zari), meticulously woven into the finest Mulberry silks to drape royal families, brides, and noblewomen. Originating from the holy city of Varanasi, this weaving tradition has been passed down orally from fathers to sons across countless generations.",
    sections: [
      {
        heading: "The Anatomy of a Handloom",
        body: "Every single Banarasi saree is a masterpiece of precision and collaborative effort. A traditional handloom requires two to three artisans to work in unison. One operating the harness, one weaving the threads, and another managing the pattern cards. The intricate motifs are deeply inspired by nature and Persian culture, featuring complex floral vines (Jhallar), hunting scenes (Shikargah), and the legendary paisley medallion."
      },
      {
        heading: "A Labor of Patience and Pride",
        body: "A masterpiece handloom saree can take anywhere from fifteen days to six full months of labor, with weavers working under natural light to capture the exact tension of silk. Modern power looms cannot replicate the unique weight, drape, and tactile variation of a handloom Banarasi. By choosing authentic heritage silks, we are not only investing in wearable art but also sustaining the livelihood of thousands of artisan families whose heritage is threatened by automation."
      },
      {
        heading: "Preserving the Craft for Tomorrow",
        body: "With the rise of cheap synthetic imitations, the authenticity of the Banarasi craft is under constant threat. Genuine GI-tagged (Geographical Indication) Banarasi silks are distinguishable by their reverse weave—showing loose threads where the Zari has been floats-cut. Supporting handloom weavers ensures that this three-thousand-year-old weaving legacy continues to beat in the heart of modern fashion."
      }
    ],
    pullQuote: "Every single thread in a handloom Banarasi is a whisper of history, woven with dedication and ancient artistry.",
    shopCategory: "Sarees",
  },
  {
    id: "2",
    title: "Artisanal Grace: How Traditional Jewelry Defines Modern Luxury",
    category: "Heritage Jewelry",
    date: "June 10, 2026",
    readTime: "4 min read",
    imageUri: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
    excerpt: "From the royal courts of Rajasthan to modern runways, discover how heritage jewelry techniques like Kundan and Temple designs...",
    authorName: "Devendra Rathore",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    dropCapLetter: "A",
    firstParagraphRemainder: "dornment in the Indian subcontinent has always transcended mere decoration. It is an expression of cosmic order, status, and deep-rooted spiritual values. Techniques like Kundan, Meenakari, and South Indian Temple jewelry represent centuries of metallurgical refinement, starting in the royal ateliers of Rajasthan's Rajput rulers and Tamil Nadu's Chola kings.",
    sections: [
      {
        heading: "The Mystique of Kundan & Meenakari",
        body: "Kundan involves setting highly refined, pure gold foil around gemstones to create a seamless, brilliant grip. Meenakari, often done on the reverse side of Kundan jewelry, is the arduous art of enameling metal surfaces with crushed mineral oxides, which are then fired in furnaces to achieve glass-like colors. This dual-sided beauty means a piece of jewelry is as much of a secret work of art for the wearer as it is for the observer."
      },
      {
        heading: "Sacred Adornments and Temple Gold",
        body: "Temple jewelry, recognizable by its rich matte gold finishes, depicts temple architecture, deities, and sacred flora. Originally donated to temples by royalties, this jewelry became an essential ornament for classical dancers. The heavy gold castings and intricate filigree work represent the pinnacle of South Indian metal craft, requiring weeks of hand-chiseling by master goldsmiths."
      },
      {
        heading: "Styling Heritage in the Modern Age",
        body: "In modern styling, these historical pieces serve as bold statements of personal identity. Paired with a contemporary minimalist gown or a crisp silk blazer, they create an exquisite contrast that honors ancestral roots while asserting a highly forward-thinking, luxury lifestyle."
      }
    ],
    pullQuote: "Heritage jewelry is more than an accessory—it is a piece of history you wear against your skin.",
    shopCategory: "Jewelry & Accessories",
  },
  {
    id: "3",
    title: "Bringing Rural Soul to Urban Homes: Terracotta & Lippan Art",
    category: "Rural Decor",
    date: "June 08, 2026",
    readTime: "6 min read",
    imageUri: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800",
    excerpt: "Discover the rustic warmth and textures of clay pottery and Kutch mirror work, and how they enrich contemporary living...",
    authorName: "Meera Deshmukh",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    dropCapLetter: "I",
    firstParagraphRemainder: "n our hyper-digitized, mass-produced world, our living spaces often crave organic authenticity. Clay-based handicrafts like Rajasthani Terracotta and Kutch's famous Lippan art (mud-and-mirror relief work) are two ancient crafts that directly connect our modern homes with the tactile raw essence of the earth, bringing visual warmth and heritage to minimalist spaces.",
    sections: [
      {
        heading: "Lippan Art: Stars of the Kutch Desert",
        body: "Traditionally, Lippan art was used by the women of the Kutch desert to decorate the circular mud cottages (Bhungas). Crafted from a precise mixture of clay and wild animal dung (which acts as a binding fiber), the relief work is molded entirely by hand, embedded with small mirrors, and painted in bright white clay. These mirrors reflect the gentle light of oil lamps, making dark interiors feel alive with stars, while the mud keeps the cottage cool in summer and warm in winter."
      },
      {
        heading: "The Ancient Magic of Terracotta",
        body: "Terracotta—meaning 'baked earth'—is one of humanity's earliest artistic mediums. From the Mohenjo-Daro figurines to rural cooking pots, clay work tells a story of local soil, water, and fire. Placing a handcrafted terracotta vase or a Lippan wall frame in a modern apartment introduces a vital focal point of warmth and texture, grounding our daily life in organic craftsmanship."
      },
      {
        heading: "Creating a Mindful Space",
        body: "Integrating earth-born art forms into contemporary design prompts us to slow down. The minor imperfections in handcrafted mud murals and wood carvings are not flaws; they are the thumbprints of the artist, signaling a connection to the soil and a rejection of industrialized monotony."
      }
    ],
    pullQuote: "To bring clay into your home is to bring the earth inside, reminding us of the human hands that shaped it.",
    shopCategory: "Handmade Crafts",
  }
];

export default function BlogsCarousel() {
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const insets = useSafeAreaInsets();

  const handleShopStory = (categoryName: string) => {
    setSelectedBlog(null);
    router.push({
      pathname: "/shop",
      params: { category: categoryName }
    });
  };

  return (
    <View className="my-6">
      {/* SECTION HEADER */}
      <View className="px-6 flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="journal-outline" size={22} color="#D4AF37" />
          <Text className="text-text-primary font-serif text-2xl ml-2.5">The IQVenus Journal</Text>
        </View>
      </View>

      {/* HORIZONTAL SCROLL CAROUSEL */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 18 }}
      >
        {RICH_PREMIUM_BLOGS.map((blog) => (
          <TouchableOpacity
            key={blog.id}
            activeOpacity={0.9}
            className="w-80 rounded-3xl overflow-hidden bg-surface border border-surface-light shadow-lg"
            onPress={() => setSelectedBlog(blog)}
          >
            {/* Card Cover Image */}
            <View className="relative">
              <Image
                source={{ uri: resolveImageUrl(blog.imageUri) }}
                style={{ width: "100%", height: 180 }}
                className="bg-surface-light"
                contentFit="cover"
                transition={200}
              />
              <View className="absolute top-3 left-3 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <Text className="text-primary text-[9px] font-sans font-bold uppercase tracking-widest">
                  {blog.category}
                </Text>
              </View>
            </View>

            {/* Card Content */}
            <View className="p-5">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <Image
                    source={{ uri: resolveImageUrl(blog.authorAvatar) }}
                    style={{ width: 18, height: 18, borderRadius: 9 }}
                  />
                  <Text className="text-text-tertiary text-[10px] font-sans ml-1.5">
                    {blog.authorName}
                  </Text>
                </View>
                <Text className="text-text-tertiary text-[10px] font-sans">
                  {blog.readTime}
                </Text>
              </View>

              <Text className="text-text-primary font-serif text-base mb-2 font-semibold leading-tight" numberOfLines={2}>
                {blog.title}
              </Text>

              <Text className="text-text-tertiary font-sans text-xs mb-4 leading-relaxed" numberOfLines={2}>
                {blog.excerpt}
              </Text>

              <View className="flex-row items-center border-t border-surface-light/40 pt-3">
                <Text className="text-primary font-sans font-bold text-xs uppercase tracking-wider mr-1">
                  Read Story
                </Text>
                <Ionicons name="arrow-forward" size={14} color="#D4AF37" />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* EDITORIAL STORY READER MODAL (HIGH END FULL SCREEN VIEWPORT) */}
      <Modal
        visible={!!selectedBlog}
        animationType="slide"
        presentationStyle="overFullScreen"
        transparent={false}
        onRequestClose={() => setSelectedBlog(null)}
      >
        <View className="flex-1 bg-background">
          {selectedBlog && (
            <View className="flex-1 relative">
              {/* ABSOLUTE FLOATING CLOSE BADGE */}
              <TouchableOpacity
                onPress={() => setSelectedBlog(null)}
                style={{ top: insets.top + 16, right: 20 }}
                className="absolute z-50 bg-black/60 w-11 h-11 rounded-full border border-white/10 flex justify-center items-center shadow-lg active:bg-black/80"
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
              >
                {/* 1. Large Hero Cover Image (Starts at absolute y=0, Behind Close Button) */}
                <View className="relative w-full" style={{ height: SCREEN_HEIGHT * 0.48 }}>
                  <Image
                    source={{ uri: resolveImageUrl(selectedBlog.imageUri) }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                  {/* Subtle dark bottom fade overlay */}
                  <View className="absolute inset-0 bg-gradient-to-t from-background via-black/10 to-black/35" />
                  
                  {/* Category Pill Tag Overlay at bottom left of cover */}
                  <View className="absolute bottom-6 left-6 bg-primary px-4 py-1.5 rounded-full shadow-lg border border-primary-light/20">
                    <Text className="text-background font-sans font-bold text-[10px] uppercase tracking-wider">
                      {selectedBlog.category}
                    </Text>
                  </View>
                </View>

                {/* 2. Article Contents */}
                <View className="px-6 pt-8">
                  {/* Sub-header Brand Info */}
                  <Text className="text-primary font-sans text-xs uppercase tracking-widest font-bold mb-2">
                    {selectedBlog.date} • {selectedBlog.readTime}
                  </Text>

                  {/* Dramatic Title */}
                  <Text className="text-text-primary font-serif text-3xl mb-6 leading-tight">
                    {selectedBlog.title}
                  </Text>

                  {/* Author Block */}
                  <View className="flex-row items-center mb-8 bg-surface/50 border border-surface-light/40 p-4 rounded-2xl">
                    <Image
                      source={{ uri: resolveImageUrl(selectedBlog.authorAvatar) }}
                      style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1.5, borderColor: "#D4AF37" }}
                    />
                    <View className="ml-3.5">
                      <Text className="text-text-primary font-serif text-sm font-semibold">
                        {selectedBlog.authorName}
                      </Text>
                      <Text className="text-text-tertiary font-sans text-[11px]">
                        Master Curator, IQVenus Editorial
                      </Text>
                    </View>
                  </View>

                  {/* Gold Separator */}
                  <View className="w-16 h-1 bg-primary mb-8 rounded-full" />

                  {/* First Paragraph with Drop Cap (using a flex row) */}
                  <View className="flex-row items-start mb-8">
                    <View className="bg-primary/10 border border-primary/20 w-12 h-12 rounded-lg flex justify-center items-center mr-3 mt-1.5">
                      <Text className="text-primary font-serif text-3xl font-bold leading-[30px]">
                        {selectedBlog.dropCapLetter}
                      </Text>
                    </View>
                    <Text className="text-text-secondary font-sans text-sm leading-relaxed flex-1">
                      {selectedBlog.firstParagraphRemainder}
                    </Text>
                  </View>

                  {/* Dynamic sections rendering */}
                  {selectedBlog.sections.map((section, idx) => (
                    <View key={idx} className="mb-6">
                      <Text className="text-primary font-serif text-lg mb-2">
                        {section.heading}
                      </Text>
                      <Text className="text-text-secondary font-sans text-sm leading-relaxed text-justify">
                        {section.body}
                      </Text>
                    </View>
                  ))}

                  {/* 3. Pull Quote Section */}
                  <View className="my-8 px-6 py-5 border-l-2 border-primary bg-surface/40 rounded-r-2xl italic">
                    <Text className="text-primary font-serif text-base leading-relaxed mb-2">
                      "{selectedBlog.pullQuote}"
                    </Text>
                    <Text className="text-text-tertiary font-sans text-[10px] uppercase tracking-wider">
                      — Curators Note
                    </Text>
                  </View>

                  {/* Gold Decorative Divider */}
                  <View className="items-center my-8">
                    <View className="flex-row items-center gap-2">
                      <View className="w-8 h-[1px] bg-primary/30" />
                      <Ionicons name="sparkles" size={12} color="#D4AF37" />
                      <View className="w-8 h-[1px] bg-primary/30" />
                    </View>
                  </View>

                  {/* 4. Shop the Story (CTA linking directly to ecommerce category) */}
                  <View className="bg-surface border border-primary/20 rounded-3xl p-6 items-center shadow-lg">
                    <Ionicons name="gift-outline" size={24} color="#D4AF37" className="mb-2" />
                    <Text className="text-text-primary font-serif text-lg text-center mb-1">
                      Inspired by this craft?
                    </Text>
                    <Text className="text-text-tertiary font-sans text-xs text-center mb-4 leading-relaxed">
                      Discover authentic, handpicked {selectedBlog.shopCategory.toLowerCase()} directly from rural weavers and master artisans.
                    </Text>

                    <TouchableOpacity
                      className="bg-primary px-6 py-3 rounded-full flex-row items-center"
                      activeOpacity={0.8}
                      onPress={() => handleShopStory(selectedBlog.shopCategory)}
                    >
                      <Text className="text-background font-sans font-bold text-xs uppercase tracking-wider mr-2">
                        Shop {selectedBlog.shopCategory}
                      </Text>
                      <Ionicons name="arrow-forward" size={14} color="#0B0B0B" />
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
