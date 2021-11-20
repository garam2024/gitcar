
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger

class Pagination:

    def PaginatorManager(self, request, queryset):
        page = request.GET.get('page', 1)
        paginator = Paginator(queryset, 10)
        max_index = len(paginator.page_range)
        current_page = int(page) if page else 1
        page_numbers_range = 5  # Display only 5 page numbers
        start_index = int((current_page - 1) / page_numbers_range) * page_numbers_range
        end_index = start_index + page_numbers_range

        if end_index >= max_index:
            end_index = max_index

        page_range = paginator.page_range[start_index:end_index]
        print(start_index, end_index)
        try:
            queryset = paginator.page(page)
        except PageNotAnInteger:
            queryset = paginator.page(1)
        except EmptyPage:
            queryset = paginator.page(paginator.num_pages)

        return page_range, queryset
