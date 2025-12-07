const paginate = (schema: any) => {
  schema.statics.paginate = async function (filter: any, options: any) {
    let sort = "";
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(",").forEach((sortOption: string) => {
        const [key, order] = sortOption.split(":");
        sortingCriteria.push((order === "desc" ? "-" : "") + key);
      });
      sort = sortingCriteria.join(" ");
    } else {
      sort = "createdAt";
    }

    const limit =
      options.limit && parseInt(options.limit, 10) > 0
        ? parseInt(options.limit, 10)
        : 10;
    const page =
      options.page && parseInt(options.page, 10) > 0
        ? parseInt(options.page, 10)
        : 1;
    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (options.populate) {
      options.populate.split(",").forEach((populateOption: string) => {
        const [field, ...fieldsToPopulate] = populateOption.trim().split(" ");
        let populateFields = "";
        if (fieldsToPopulate.length > 0) {
          populateFields = fieldsToPopulate.join(" ");
        }
        docsPromise = docsPromise.populate({
          path: field,
          select: populateFields,
        });
      });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        page,
        limit,
        totalPages,
        totalResults,
      };
      return Promise.resolve(result);
    });
  };
};

export default paginate;

// const options = {
//   sortBy: 'createdAt:desc',
//   limit: 10,
//   page: 1,
//   populate: 'crewLeaders image username name email, affiliations' // Specify fields for crewLeaders and affiliations
// };
// Example
