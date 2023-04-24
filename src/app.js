import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import axios from 'axios';

const API_KEY = '33377492-476d22b77d4b85ba3622e340f';
const API_URL = 'https://pixabay.com/api/';

const form = document.getElementById('search-form');
const input = document.querySelector('input[name="searchQuery"]');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

let searchQuery = '';
let currentPage = 1;

const lightbox = new SimpleLightbox('.gallery a', {
  /* опції */
});

form.addEventListener('submit', event => {
  event.preventDefault();
  searchQuery = input.value.trim();

  if (!searchQuery) {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }

  clearGallery();
  fetchImages();
});

loadMoreButton.addEventListener('click', () => {
  currentPage++;
  fetchImages();
});

async function fetchImages() {
  try {
    const { data } = await axios.get(`${API_URL}`, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: 40,
      },
    });

    if (data.hits.length === 0 && currentPage === 1) {
      Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    renderImages(data.hits);
    checkIfLastPage(data.totalHits);

    // Показати повідомлення про кількість знайдених зображень
    if (currentPage === 1) {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
    }
  } catch (error) {
    console.error(error);
  }
}

function clearGallery() {
  gallery.innerHTML = '';
  currentPage = 1;
  loadMoreButton.hidden = true;
}

function renderImages(images) {
  const markup = images.map(image => createImageCardMarkup(image)).join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh(); // оновити SimpleLightbox
  scrollToNextPage(); // прокрутка сторінки
}
function createImageCardMarkup(image) {
  return `
        <a href="${image.largeImageURL}" class="photo-card-link">
            <div class="photo-card">
                <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
                <div class="info">
                    <p class="info-item">
                        <b>Likes:</b> ${image.likes}
                    </p>
                    <p class="info-item">
                        <b>Views:</b> ${image.views}
                    </p>
                    <p class="info-item">
                        <b>Comments:</b> ${image.comments}
                    </p>
                    <p class="info-item">
                        <b>Downloads:</b> ${image.downloads}
                    </p>
                </div>
            </div>
        </a>
    `;
}

function checkIfLastPage(totalHits) {
  const totalLoadedImages = currentPage * 40;
  if (totalLoadedImages >= totalHits) {
    loadMoreButton.hidden = true;
  } else {
    loadMoreButton.hidden = false;
  }
}

function scrollToNextPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
