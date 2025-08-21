import { onMounted, type Ref, ref } from 'vue'
import { type EmblaCarouselType } from 'embla-carousel'

export function useDotButton(
  emblaApi: Ref<EmblaCarouselType | undefined, EmblaCarouselType | undefined>
) {
  const selectedIndex = ref(0)
  const scrollSnaps = ref<number[]>([])

  const onDotButtonClick = (index: number) => {
    if (!emblaApi.value) return
    emblaApi.value.scrollTo(index)
  }

  const onInit = (api: EmblaCarouselType) => {
    scrollSnaps.value = api.scrollSnapList()
  }

  const onSelect = (api: EmblaCarouselType) => {
    selectedIndex.value = api.selectedScrollSnap()
  }

  onMounted(() => {
    if (!emblaApi.value) return

    onInit(emblaApi.value)
    onSelect(emblaApi.value)
    emblaApi.value
      .on('reInit', onInit)
      .on('reInit', onSelect)
      .on('select', onSelect)
  })

  return { selectedIndex, scrollSnaps, onDotButtonClick }
}
